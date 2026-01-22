#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, Vec};

/// Stream status enum
#[contracttype]
#[derive(Clone, Copy, PartialEq, Eq)]
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

#[contract]
pub struct PaymentStreamContract;

#[contractimpl]
impl PaymentStreamContract {
    /// Initialize the contract
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().instance().set(&Symbol::new(&env, "stream_count"), &0u64);
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
        assert!(total_amount > 0, "Amount must be positive");
        assert!(end_time > start_time, "End time must be after start time");
        
        // Get and increment stream count
        let stream_count: u64 = env.storage().instance().get(&Symbol::new(&env, "stream_count")).unwrap_or(0);
        let stream_id = stream_count + 1;
        
        // Create stream
        let stream = Stream {
            id: stream_id,
            sender: sender.clone(),
            recipient,
            token,
            total_amount,
            withdrawn_amount: 0,
            start_time,
            end_time,
            status: StreamStatus::Active,
        };
        
        // Store stream
        env.storage().persistent().set(&stream_id, &stream);
        env.storage().instance().set(&Symbol::new(&env, "stream_count"), &stream_id);
        
        stream_id
    }

    /// Get stream details
    pub fn get_stream(env: Env, stream_id: u64) -> Option<Stream> {
        env.storage().persistent().get(&stream_id)
    }

    /// Calculate withdrawable amount for a stream
    pub fn withdrawable_amount(env: Env, stream_id: u64) -> i128 {
        let stream: Stream = env.storage().persistent().get(&stream_id).expect("Stream not found");
        
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
        let mut stream: Stream = env.storage().persistent().get(&stream_id).expect("Stream not found");
        stream.recipient.require_auth();
        
        let available = Self::withdrawable_amount(env.clone(), stream_id);
        assert!(amount <= available, "Insufficient withdrawable amount");
        
        stream.withdrawn_amount += amount;
        
        // Check if stream is completed
        if stream.withdrawn_amount >= stream.total_amount {
            stream.status = StreamStatus::Completed;
        }
        
        env.storage().persistent().set(&stream_id, &stream);
        
        // TODO: Transfer tokens to recipient
    }

    /// Pause a stream (sender only)
    pub fn pause_stream(env: Env, stream_id: u64) {
        let mut stream: Stream = env.storage().persistent().get(&stream_id).expect("Stream not found");
        stream.sender.require_auth();
        
        assert!(stream.status == StreamStatus::Active, "Stream is not active");
        stream.status = StreamStatus::Paused;
        
        env.storage().persistent().set(&stream_id, &stream);
    }

    /// Resume a paused stream (sender only)
    pub fn resume_stream(env: Env, stream_id: u64) {
        let mut stream: Stream = env.storage().persistent().get(&stream_id).expect("Stream not found");
        stream.sender.require_auth();
        
        assert!(stream.status == StreamStatus::Paused, "Stream is not paused");
        stream.status = StreamStatus::Active;
        
        env.storage().persistent().set(&stream_id, &stream);
    }

    /// Cancel a stream (sender only)
    pub fn cancel_stream(env: Env, stream_id: u64) {
        let mut stream: Stream = env.storage().persistent().get(&stream_id).expect("Stream not found");
        stream.sender.require_auth();
        
        assert!(stream.status == StreamStatus::Active || stream.status == StreamStatus::Paused, "Stream cannot be canceled");
        stream.status = StreamStatus::Canceled;
        
        env.storage().persistent().set(&stream_id, &stream);
        
        // TODO: Return remaining tokens to sender
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger};

    #[test]
    fn test_create_stream() {
        let env = Env::default();
        env.mock_all_auths();
        
        let contract_id = env.register(PaymentStreamContract, ());
        let client = PaymentStreamContractClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = Address::generate(&env);
        
        client.initialize(&admin);
        
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
    }

    #[test]
    fn test_withdrawable_amount() {
        let env = Env::default();
        env.mock_all_auths();
        
        let contract_id = env.register(PaymentStreamContract, ());
        let client = PaymentStreamContractClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = Address::generate(&env);
        
        client.initialize(&admin);
        
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
}
