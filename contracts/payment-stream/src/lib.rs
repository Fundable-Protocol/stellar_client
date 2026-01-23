#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    token, panic_with_error,
    Address, Env, Symbol,
};

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
}

const LEDGER_THRESHOLD: u32 = 518400; // ~30 days at 5s/ledger
const LEDGER_BUMP: u32 = 535680; // ~31 days

#[contract]
pub struct PaymentStreamContract;

#[contractimpl]
impl PaymentStreamContract {
    /// Initialize the contract
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&Symbol::new(&env, "admin")) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "stream_count"), &0u64);
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

    /// Get stream details
    pub fn get_stream(env: Env, stream_id: u64) -> Option<Stream> {
        if !env.storage().persistent().has(&stream_id) {
            return None;
        }
        // Extend TTL on read for safety
        env.storage().persistent().extend_ttl(&stream_id, LEDGER_THRESHOLD, LEDGER_BUMP);
        env.storage().persistent().get(&stream_id)
    }

    /// Calculate withdrawable amount for a stream
    pub fn withdrawable_amount(env: Env, stream_id: u64) -> i128 {
        let stream: Stream = match Self::get_stream(env.clone(), stream_id) {
            Some(s) => s,
            None => panic_with_error!(&env, Error::StreamNotFound),
        };

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
        let mut stream: Stream = match Self::get_stream(env.clone(), stream_id) {
            Some(s) => s,
            None => panic_with_error!(&env, Error::StreamNotFound),
        };
        stream.recipient.require_auth();

        let available = Self::withdrawable_amount(env.clone(), stream_id);
        if amount > available || amount <= 0 {
            panic_with_error!(&env, Error::InsufficientWithdrawable);
        }

        stream.withdrawn_amount += amount;

        // Check if stream is completed
        if stream.withdrawn_amount >= stream.total_amount {
            stream.status = StreamStatus::Completed;
        }

        env.storage().persistent().set(&stream_id, &stream);
        env.storage().persistent().extend_ttl(&stream_id, LEDGER_THRESHOLD, LEDGER_BUMP);

        // Transfer tokens to recipient
        let token_client = token::Client::new(&env, &stream.token);
        token_client.transfer(&env.current_contract_address(), &stream.recipient, &amount);
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
        let mut stream: Stream = match Self::get_stream(env.clone(), stream_id) {
            Some(s) => s,
            None => panic_with_error!(&env, Error::StreamNotFound),
        };
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
        let mut stream: Stream = match Self::get_stream(env.clone(), stream_id) {
            Some(s) => s,
            None => panic_with_error!(&env, Error::StreamNotFound),
        };
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
        let mut stream: Stream = match Self::get_stream(env.clone(), stream_id) {
            Some(s) => s,
            None => panic_with_error!(&env, Error::StreamNotFound),
        };
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
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, Ledger, MockAuth, MockAuthInvoke},
        IntoVal, token,
    };

    #[test]
    fn test_create_stream() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        let sac = env.register_stellar_asset_contract_v2(admin.clone());
        let token = sac.address();

        let contract_id = env.register(PaymentStreamContract);
        let client = PaymentStreamContractClient::new(&env, &contract_id);

        client.initialize(&admin);

        // Mint tokens to sender
        let token_admin = token::StellarAssetClient::new(&env, &token);
        token_admin.mint(&sender, &1000);

        let stream_id = client.create_stream(
            &sender,
            &recipient,
            &token,
            &1000,
            &0,
            &100,
        );

        assert_eq!(stream_id, 1);

        let stream = client.get_stream(&stream_id).unwrap();
        assert_eq!(stream.total_amount, 1000);
        assert_eq!(stream.status, StreamStatus::Active);

        // Check contract balance
        let token_client = token::Client::new(&env, &token);
        assert_eq!(token_client.balance(&contract_id), 1000);
    }

    #[test]
    fn test_withdrawable_amount() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        let sac = env.register_stellar_asset_contract_v2(admin.clone());
        let token = sac.address();

        let contract_id = env.register(PaymentStreamContract);
        let client = PaymentStreamContractClient::new(&env, &contract_id);

        client.initialize(&admin);

        // Mint tokens to sender
        let token_admin = token::StellarAssetClient::new(&env, &token);
        token_admin.mint(&sender, &1000);

        // Create stream: 1000 tokens over 100 seconds
        let stream_id = client.create_stream(
            &sender,
            &recipient,
            &token,
            &1000,
            &0,
            &100,
        );

        // At time 50, should be able to withdraw 500
        env.ledger().set_timestamp(50);
        let available = client.withdrawable_amount(&stream_id);
        assert_eq!(available, 500);
    }

    #[test]
    fn test_withdraw() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        let sac = env.register_stellar_asset_contract_v2(admin.clone());
        let token = sac.address();

        let contract_id = env.register(PaymentStreamContract);
        let client = PaymentStreamContractClient::new(&env, &contract_id);

        client.initialize(&admin);

        // Mint tokens to sender
        let token_admin = token::StellarAssetClient::new(&env, &token);
        token_admin.mint(&sender, &1000);

        let stream_id = client.create_stream(
            &sender,
            &recipient,
            &token,
            &1000,
            &0,
            &100,
        );

        env.ledger().set_timestamp(50);

        client.withdraw(&stream_id, &300);

        let stream = client.get_stream(&stream_id).unwrap();
        assert_eq!(stream.withdrawn_amount, 300);

        let token_client = token::Client::new(&env, &token);
        assert_eq!(token_client.balance(&recipient), 300);
        assert_eq!(token_client.balance(&contract_id), 700);
    }

    #[test]
    fn test_withdraw_max() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        let sac = env.register_stellar_asset_contract_v2(admin.clone());
        let token = sac.address();

        let contract_id = env.register(PaymentStreamContract);
        let client = PaymentStreamContractClient::new(&env, &contract_id);

        client.initialize(&admin);

        // Mint tokens to sender
        let token_admin = token::StellarAssetClient::new(&env, &token);
        token_admin.mint(&sender, &1000);

        let stream_id = client.create_stream(
            &sender,
            &recipient,
            &token,
            &1000,
            &0,
            &100,
        );

        env.ledger().set_timestamp(50);

        client.withdraw_max(&stream_id);

        let stream = client.get_stream(&stream_id).unwrap();
        assert_eq!(stream.withdrawn_amount, 500);

        let token_client = token::Client::new(&env, &token);
        assert_eq!(token_client.balance(&recipient), 500);
        assert_eq!(token_client.balance(&contract_id), 500);
    }

    #[test]
    fn test_cancel_stream() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        let sac = env.register_stellar_asset_contract_v2(admin.clone());
        let token = sac.address();

        let contract_id = env.register(PaymentStreamContract);
        let client = PaymentStreamContractClient::new(&env, &contract_id);

        client.initialize(&admin);

        // Mint tokens to sender
        let token_admin = token::StellarAssetClient::new(&env, &token);
        token_admin.mint(&sender, &1000);

        let stream_id = client.create_stream(
            &sender,
            &recipient,
            &token,
            &1000,
            &0,
            &100,
        );

        env.ledger().set_timestamp(50);
        client.withdraw(&stream_id, &500);

        client.cancel_stream(&stream_id);

        let stream = client.get_stream(&stream_id).unwrap();
        assert_eq!(stream.status, StreamStatus::Canceled);

        let token_client = token::Client::new(&env, &token);
        assert_eq!(token_client.balance(&sender), 500); // Remaining refunded
        assert_eq!(token_client.balance(&contract_id), 0);
    }

    #[test]
    #[should_panic(expected = "StreamNotFound")]
    fn test_get_nonexistent_stream() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);

        let contract_id = env.register(PaymentStreamContract);
        let client = PaymentStreamContractClient::new(&env, &contract_id);

        client.initialize(&admin);

        client.get_stream(&999); // Should panic
    }

    #[test]
    #[should_panic(expected = "Unauthorized")]
    fn test_unauthorized_withdraw() {
        let env = Env::default();

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        let sac = env.register_stellar_asset_contract_v2(admin.clone());
        let token = sac.address();

        let contract_id = env.register(PaymentStreamContract);
        let client = PaymentStreamContractClient::new(&env, &contract_id);

        // Mock auth only for init and create
        env.mock_auths(&[
            MockAuth {
                address: &admin,
                invoke: &MockAuthInvoke {
                    contract: &contract_id,
                    fn_name: "initialize",
                    args: (&admin,).into_val(&env),
                    sub_invokes: &[],
                },
            },
            MockAuth {
                address: &sender,
                invoke: &MockAuthInvoke {
                    contract: &contract_id,
                    fn_name: "create_stream",
                    args: (&sender, &recipient, &token, 1000i128, 0u64, 100u64).into_val(&env),
                    sub_invokes: &[],
                },
            },
        ]);

        client.initialize(&admin);

        // Mint tokens to sender
        let token_admin = token::StellarAssetClient::new(&env, &token);
        token_admin.mint(&sender, &1000);

        let stream_id = client.create_stream(
            &sender,
            &recipient,
            &token,
            &1000,
            &0,
            &100,
        );

        env.ledger().set_timestamp(50);

        // No auth for withdraw → should panic on require_auth
        client.withdraw(&stream_id, &300);
    }
}