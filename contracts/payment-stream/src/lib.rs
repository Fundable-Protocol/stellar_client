#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, panic_with_error, token, Address, Env, Symbol};

/// Stream status enum
#[contracttype]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum StreamStatus {
    Active,
    Paused,
    Canceled,
    Completed,
}

/// Stream data structure
#[contracttype]
#[derive(Clone)]
pub struct Stream {
    pub id: u64,
    pub sender: Address,
    pub recipient: Address,
    pub token: Address,
    pub total_amount: i128,
    pub withdrawn_amount: i128,
    pub start_time: u64,
    pub end_time: u64,
    pub status: StreamStatus,
}

/// Fee collected event data
#[contracttype]
#[derive(Clone)]
pub struct FeeCollectedEvent {
    pub stream_id: u64,
    pub amount: i128,
}

/// Custom errors for the contract
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
    InvalidTimeRange = 5,
    StreamNotFound = 6,
    StreamNotActive = 7,
    StreamNotPaused = 8,
    StreamCannotBeCanceled = 9,
    InsufficientWithdrawable = 10,
    TransferFailed = 11,
    FeeTooHigh = 12,
    InvalidRecipient = 13,
}

// consts defined above
const MAX_FEE: u32 = 500; // 5% in basis points

const LEDGER_THRESHOLD: u32 = 518400; // ~30 days at 5s/ledger
const LEDGER_BUMP: u32 = 535680; // ~31 days

#[contract]
pub struct PaymentStreamContract;

#[contractimpl]
impl PaymentStreamContract {
    /// Initialize the contract
    pub fn initialize(env: Env, admin: Address, fee_collector: Address, general_fee_rate: u32) {
        if env.storage().instance().has(&Symbol::new(&env, "admin")) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        if general_fee_rate > MAX_FEE {
            panic_with_error!(&env, Error::FeeTooHigh);
        }
        admin.require_auth();
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "stream_count"), &0u64);
        env.storage().instance().set(&Symbol::new(&env, "fee_collector"), &fee_collector);
        env.storage().instance().set(&Symbol::new(&env, "general_protocol_fee_rate"), &general_fee_rate);
        env.storage().instance().extend_ttl(LEDGER_THRESHOLD, LEDGER_BUMP);
    }

    /// Create a new payment stream
    pub fn create_stream(
        env: Env,
        sender: Address,
        recipient: Address,
        token: Address,
        total_amount: i128,
        start_time: u64,
        end_time: u64,
    ) -> u64 {
        sender.require_auth();

        // Validate inputs
        if total_amount <= 0 {
            panic_with_error!(&env, Error::InvalidAmount);
        }
        if end_time <= start_time {
            panic_with_error!(&env, Error::InvalidTimeRange);
        }

        // Get and increment stream count
        let mut stream_count: u64 = env.storage().instance().get(&Symbol::new(&env, "stream_count")).unwrap_or(0);
        let stream_id = stream_count + 1;
        stream_count += 1;
        env.storage().instance().set(&Symbol::new(&env, "stream_count"), &stream_count);
        env.storage().instance().extend_ttl(LEDGER_THRESHOLD, LEDGER_BUMP);

        // Create stream
        let stream = Stream {
            id: stream_id,
            sender: sender.clone(),
            recipient: recipient.clone(),
            token: token.clone(),
            total_amount,
            withdrawn_amount: 0,
            start_time,
            end_time,
            status: StreamStatus::Active,
        };

        // Store stream and extend TTL
        env.storage().persistent().set(&stream_id, &stream);
        env.storage().persistent().extend_ttl(&stream_id, LEDGER_THRESHOLD, LEDGER_BUMP);

        // Transfer tokens from sender to contract (escrow)
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&sender, &env.current_contract_address(), &total_amount);

        stream_id
    }


    /// Get stream details (moved up for visibility)
    pub fn get_stream(env: Env, stream_id: u64) -> Stream {
        match env.storage().persistent().get(&stream_id) {
            Some(stream) => {
                env.storage().persistent().extend_ttl(&stream_id, LEDGER_THRESHOLD, LEDGER_BUMP);
                stream
            },
            None => panic_with_error!(&env, Error::StreamNotFound),
        }
    }

    /// Calculate the protocol fee for a given amount
    fn calculate_protocol_fee(env: &Env, amount: i128) -> i128 {
        let fee_rate: u32 = env.storage().instance().get(&Symbol::new(env, "general_protocol_fee_rate")).unwrap_or(0);

        if fee_rate == 0 || amount <= 0 {
            return 0;
        }

        // fee = (amount * fee_rate) / 10000
        // To avoid overflow, use checked operations
        let fee = (amount / 10000) * (fee_rate as i128);
        fee.max(0)
    }


    /// Calculate withdrawable amount for a stream
    pub fn withdrawable_amount(env: Env, stream_id: u64) -> i128 {
        let stream: Stream = Self::get_stream(env.clone(), stream_id);


        if stream.status != StreamStatus::Active {
            return 0;
        }

        let current_time = env.ledger().timestamp();

        if current_time <= stream.start_time {
            return 0;
        }

        let elapsed = if current_time >= stream.end_time {
            stream.end_time - stream.start_time
        } else {
            current_time - stream.start_time
        };

        let duration = stream.end_time - stream.start_time;
        let vested = (stream.total_amount * elapsed as i128) / duration as i128;

        vested - stream.withdrawn_amount
    }

    /// Withdraw from a stream
    pub fn withdraw(env: Env, stream_id: u64, amount: i128) {
        let mut stream: Stream = Self::get_stream(env.clone(), stream_id);

        stream.recipient.require_auth();

        let available = Self::withdrawable_amount(env.clone(), stream_id);
        if amount > available || amount <= 0 {
            panic_with_error!(&env, Error::InsufficientWithdrawable);
        }

        // Calculate protocol fee
        let fee = Self::calculate_protocol_fee(&env, amount);
        let net_amount = amount - fee;

        stream.withdrawn_amount += amount;

        // Check if stream is completed
        if stream.withdrawn_amount >= stream.total_amount {
            stream.status = StreamStatus::Completed;
        }

        env.storage().persistent().set(&stream_id, &stream);
        env.storage().persistent().extend_ttl(&stream_id, LEDGER_THRESHOLD, LEDGER_BUMP);

        // Transfer net amount to recipient
        let token_client = token::Client::new(&env, &stream.token);
        token_client.transfer(&env.current_contract_address(), &stream.recipient, &net_amount);

        // Transfer fee to collector if fee > 0
        if fee > 0 {
            let fee_collector: Address = env.storage().instance().get(&Symbol::new(&env, "fee_collector")).unwrap();
            token_client.transfer(&env.current_contract_address(), &fee_collector, &fee);
            // Emit FeeCollected event
            env.events().publish(("FeeCollected", stream_id), fee);
        }
    }

    /// Withdraw the maximum available amount from a stream
    pub fn withdraw_max(env: Env, stream_id: u64) {
        let available = Self::withdrawable_amount(env.clone(), stream_id);
        if available <= 0 {
            panic_with_error!(&env, Error::InsufficientWithdrawable);
        }
        Self::withdraw(env, stream_id, available);
    }

    /// Pause a stream (sender only)
    pub fn pause_stream(env: Env, stream_id: u64) {
      let mut stream: Stream = Self::get_stream(env.clone(), stream_id);

        stream.sender.require_auth();

        if stream.status != StreamStatus::Active {
            panic_with_error!(&env, Error::StreamNotActive);
        }
        stream.status = StreamStatus::Paused;

        env.storage().persistent().set(&stream_id, &stream);
        env.storage().persistent().extend_ttl(&stream_id, LEDGER_THRESHOLD, LEDGER_BUMP);
    }

    /// Resume a paused stream (sender only)
    pub fn resume_stream(env: Env, stream_id: u64) {
        let mut stream: Stream = Self::get_stream(env.clone(), stream_id);

        stream.sender.require_auth();

        if stream.status != StreamStatus::Paused {
            panic_with_error!(&env, Error::StreamNotPaused);
        }
        stream.status = StreamStatus::Active;

        env.storage().persistent().set(&stream_id, &stream);
        env.storage().persistent().extend_ttl(&stream_id, LEDGER_THRESHOLD, LEDGER_BUMP);
    }

    /// Cancel a stream (sender only)
    pub fn cancel_stream(env: Env, stream_id: u64) {
      let mut stream: Stream = Self::get_stream(env.clone(), stream_id);

        stream.sender.require_auth();

        if stream.status != StreamStatus::Active && stream.status != StreamStatus::Paused {
            panic_with_error!(&env, Error::StreamCannotBeCanceled);
        }
        stream.status = StreamStatus::Canceled;

        env.storage().persistent().set(&stream_id, &stream);
        env.storage().persistent().extend_ttl(&stream_id, LEDGER_THRESHOLD, LEDGER_BUMP);

        // Refund remaining tokens to sender
        let remaining = stream.total_amount - stream.withdrawn_amount;
        if remaining > 0 {
            let token_client = token::Client::new(&env, &stream.token);
            token_client.transfer(&env.current_contract_address(), &stream.sender, &remaining);
        }
    }

    /// Set the protocol fee rate (admin only)
    pub fn set_protocol_fee_rate(env: Env, new_fee_rate: u32) {
        let admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).unwrap();
        admin.require_auth();

        if new_fee_rate > MAX_FEE {
            panic_with_error!(&env, Error::FeeTooHigh);
        }

        env.storage().instance().set(&Symbol::new(&env, "general_protocol_fee_rate"), &new_fee_rate);
        env.storage().instance().extend_ttl(LEDGER_THRESHOLD, LEDGER_BUMP);
    }

    /// Set the fee collector address (admin only)
    pub fn set_fee_collector(env: Env, new_fee_collector: Address) {
        let admin: Address = env.storage().instance().get(&Symbol::new(&env, "admin")).unwrap();
        admin.require_auth();

        env.storage().instance().set(&Symbol::new(&env, "fee_collector"), &new_fee_collector);
        env.storage().instance().extend_ttl(LEDGER_THRESHOLD, LEDGER_BUMP);
    }

    /// Get the current protocol fee rate
    pub fn get_protocol_fee_rate(env: Env) -> u32 {
        env.storage().instance().get(&Symbol::new(&env, "general_protocol_fee_rate")).unwrap_or(0)
    }

    /// Get the current fee collector
    pub fn get_fee_collector(env: Env) -> Address {
        env.storage().instance().get(&Symbol::new(&env, "fee_collector")).unwrap()
    }
}

mod test;