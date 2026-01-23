#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

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

/// Cancel request structure for consensual cancellation
/// Tracks which party initiated the cancel request
#[contracttype]
#[derive(Clone)]
pub struct CancelRequest {
    pub stream_id: u64,
    pub requester: Address,
    pub created_at: u64,
}

/// Storage key for cancel requests
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    CancelRequest(u64), // stream_id -> CancelRequest
}

#[contract]
pub struct PaymentStreamContract;

#[contractimpl]
impl PaymentStreamContract {
    /// Initialize the contract
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage()
            .instance()
            .set(&Symbol::new(&env, "admin"), &admin);
        env.storage()
            .instance()
            .set(&Symbol::new(&env, "stream_count"), &0u64);
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
        let stream_count: u64 = env
            .storage()
            .instance()
            .get(&Symbol::new(&env, "stream_count"))
            .unwrap_or(0);
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
        env.storage()
            .instance()
            .set(&Symbol::new(&env, "stream_count"), &stream_id);

        stream_id
    }

    /// Get stream details
    pub fn get_stream(env: Env, stream_id: u64) -> Option<Stream> {
        env.storage().persistent().get(&stream_id)
    }

    /// Calculate withdrawable amount for a stream
    pub fn withdrawable_amount(env: Env, stream_id: u64) -> i128 {
        let stream: Stream = env
            .storage()
            .persistent()
            .get(&stream_id)
            .expect("Stream not found");

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
        let mut stream: Stream = env
            .storage()
            .persistent()
            .get(&stream_id)
            .expect("Stream not found");
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
        let mut stream: Stream = env
            .storage()
            .persistent()
            .get(&stream_id)
            .expect("Stream not found");
        stream.sender.require_auth();

        assert!(
            stream.status == StreamStatus::Active,
            "Stream is not active"
        );
        stream.status = StreamStatus::Paused;

        env.storage().persistent().set(&stream_id, &stream);
    }

    /// Resume a paused stream (sender only)
    pub fn resume_stream(env: Env, stream_id: u64) {
        let mut stream: Stream = env
            .storage()
            .persistent()
            .get(&stream_id)
            .expect("Stream not found");
        stream.sender.require_auth();

        assert!(
            stream.status == StreamStatus::Paused,
            "Stream is not paused"
        );
        stream.status = StreamStatus::Active;

        env.storage().persistent().set(&stream_id, &stream);
    }

    /// Cancel a stream (sender only)
    pub fn cancel_stream(env: Env, stream_id: u64) {
        let mut stream: Stream = env
            .storage()
            .persistent()
            .get(&stream_id)
            .expect("Stream not found");
        stream.sender.require_auth();

        assert!(
            stream.status == StreamStatus::Active || stream.status == StreamStatus::Paused,
            "Stream cannot be canceled"
        );
        stream.status = StreamStatus::Canceled;

        env.storage().persistent().set(&stream_id, &stream);

        // TODO: Return remaining tokens to sender
    }

    /// Request consensual cancellation of a stream
    /// Can be initiated by either sender or recipient
    /// Creates a cancel request that the other party must approve
    pub fn request_cancel(env: Env, stream_id: u64, requester: Address) {
        requester.require_auth();

        let stream: Stream = env
            .storage()
            .persistent()
            .get(&stream_id)
            .expect("Stream not found");

        // Validate stream is active or paused
        assert!(
            stream.status == StreamStatus::Active || stream.status == StreamStatus::Paused,
            "Stream cannot be canceled"
        );

        // Verify requester is either sender or recipient
        assert!(
            requester == stream.sender || requester == stream.recipient,
            "Requester must be sender or recipient"
        );

        // Check if a cancel request already exists
        let cancel_key = DataKey::CancelRequest(stream_id);
        assert!(
            !env.storage().persistent().has(&cancel_key),
            "Cancel request already pending"
        );

        // Create and store cancel request
        let cancel_request = CancelRequest {
            stream_id,
            requester: requester.clone(),
            created_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&cancel_key, &cancel_request);

        // Emit CancelRequested event
        env.events().publish(
            (symbol_short!("cancel"), symbol_short!("request")),
            (stream_id, requester),
        );
    }

    /// Get pending cancel request for a stream
    pub fn get_cancel_request(env: Env, stream_id: u64) -> Option<CancelRequest> {
        let cancel_key = DataKey::CancelRequest(stream_id);
        env.storage().persistent().get(&cancel_key)
    }

    /// Approve and execute consensual cancellation
    /// Must be called by the party that did NOT initiate the cancel request
    /// Verifies the approver's signature and distributes funds fairly
    pub fn cancel_consensual(env: Env, stream_id: u64, approver: Address) {
        approver.require_auth();

        let mut stream: Stream = env
            .storage()
            .persistent()
            .get(&stream_id)
            .expect("Stream not found");

        // Validate stream is active or paused
        assert!(
            stream.status == StreamStatus::Active || stream.status == StreamStatus::Paused,
            "Stream cannot be canceled"
        );

        // Get the cancel request
        let cancel_key = DataKey::CancelRequest(stream_id);
        let cancel_request: CancelRequest = env
            .storage()
            .persistent()
            .get(&cancel_key)
            .expect("No cancel request found for this stream");

        // Verify approver is either sender or recipient
        assert!(
            approver == stream.sender || approver == stream.recipient,
            "Approver must be sender or recipient"
        );

        // Verify signature is from the OTHER party (not the requester)
        assert!(
            approver != cancel_request.requester,
            "Approver must be the other party, not the requester"
        );

        // Calculate amounts to distribute
        // Recipient gets the vested amount (what they've earned so far)
        // Sender gets the remaining unvested amount
        let current_time = env.ledger().timestamp();

        let elapsed = if current_time <= stream.start_time {
            0u64
        } else if current_time >= stream.end_time {
            stream.end_time - stream.start_time
        } else {
            current_time - stream.start_time
        };

        let duration = stream.end_time - stream.start_time;
        let vested_amount = (stream.total_amount * elapsed as i128) / duration as i128;

        // Amount recipient can claim (vested minus what they've already withdrawn)
        let recipient_payout = vested_amount - stream.withdrawn_amount;

        // Amount to refund to sender (total minus vested)
        let sender_refund = stream.total_amount - vested_amount;

        // Update stream status
        stream.status = StreamStatus::Canceled;
        env.storage().persistent().set(&stream_id, &stream);

        // Remove the cancel request
        env.storage().persistent().remove(&cancel_key);

        // Emit ConsensualCancel event with both parties' addresses and distribution details
        env.events().publish(
            (symbol_short!("cancel"), symbol_short!("consent")),
            (
                stream_id,
                stream.sender.clone(),
                stream.recipient.clone(),
                sender_refund,
                recipient_payout,
            ),
        );

        // TODO: Transfer recipient_payout to recipient
        // TODO: Transfer sender_refund to sender
    }

    /// Revoke a pending cancel request
    /// Can only be called by the original requester
    pub fn revoke_cancel_request(env: Env, stream_id: u64, requester: Address) {
        requester.require_auth();

        let cancel_key = DataKey::CancelRequest(stream_id);
        let cancel_request: CancelRequest = env
            .storage()
            .persistent()
            .get(&cancel_key)
            .expect("No cancel request found for this stream");

        // Verify the requester is the one who made the request
        assert!(
            requester == cancel_request.requester,
            "Only the original requester can revoke"
        );

        // Remove the cancel request
        env.storage().persistent().remove(&cancel_key);

        // Emit revoke event
        env.events().publish(
            (symbol_short!("cancel"), symbol_short!("revoke")),
            (stream_id, requester),
        );
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

        let stream_id = client.create_stream(&sender, &recipient, &token, &1000, &0, &100);

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
        let stream_id = client.create_stream(&sender, &recipient, &token, &1000, &0, &100);

        // At time 50, should be able to withdraw 500
        env.ledger().set_timestamp(50);
        let available = client.withdrawable_amount(&stream_id);
        assert_eq!(available, 500);
    }

    #[test]
    fn test_request_cancel_by_sender() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(PaymentStreamContract, ());
        let client = PaymentStreamContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = Address::generate(&env);

        client.initialize(&admin);

        let stream_id = client.create_stream(&sender, &recipient, &token, &1000, &0, &100);

        // Sender requests cancellation
        client.request_cancel(&stream_id, &sender);

        // Verify cancel request exists
        let cancel_request = client.get_cancel_request(&stream_id).unwrap();
        assert_eq!(cancel_request.stream_id, stream_id);
        assert_eq!(cancel_request.requester, sender);
    }

    #[test]
    fn test_request_cancel_by_recipient() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(PaymentStreamContract, ());
        let client = PaymentStreamContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = Address::generate(&env);

        client.initialize(&admin);

        let stream_id = client.create_stream(&sender, &recipient, &token, &1000, &0, &100);

        // Recipient requests cancellation
        client.request_cancel(&stream_id, &recipient);

        // Verify cancel request exists
        let cancel_request = client.get_cancel_request(&stream_id).unwrap();
        assert_eq!(cancel_request.stream_id, stream_id);
        assert_eq!(cancel_request.requester, recipient);
    }

    #[test]
    fn test_cancel_consensual_sender_requests_recipient_approves() {
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
        let stream_id = client.create_stream(&sender, &recipient, &token, &1000, &0, &100);

        // Sender requests cancellation
        client.request_cancel(&stream_id, &sender);

        // Move time to 50 seconds (50% vested)
        env.ledger().set_timestamp(50);

        // Recipient approves cancellation
        client.cancel_consensual(&stream_id, &recipient);

        // Verify stream is canceled
        let stream = client.get_stream(&stream_id).unwrap();
        assert_eq!(stream.status, StreamStatus::Canceled);

        // Verify cancel request is removed
        assert!(client.get_cancel_request(&stream_id).is_none());
    }

    #[test]
    fn test_cancel_consensual_recipient_requests_sender_approves() {
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
        let stream_id = client.create_stream(&sender, &recipient, &token, &1000, &0, &100);

        // Recipient requests cancellation
        client.request_cancel(&stream_id, &recipient);

        // Move time to 30 seconds (30% vested)
        env.ledger().set_timestamp(30);

        // Sender approves cancellation
        client.cancel_consensual(&stream_id, &sender);

        // Verify stream is canceled
        let stream = client.get_stream(&stream_id).unwrap();
        assert_eq!(stream.status, StreamStatus::Canceled);

        // Verify cancel request is removed
        assert!(client.get_cancel_request(&stream_id).is_none());
    }

    #[test]
    #[should_panic(expected = "Approver must be the other party, not the requester")]
    fn test_cancel_consensual_fails_if_same_party_approves() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(PaymentStreamContract, ());
        let client = PaymentStreamContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = Address::generate(&env);

        client.initialize(&admin);

        let stream_id = client.create_stream(&sender, &recipient, &token, &1000, &0, &100);

        // Sender requests cancellation
        client.request_cancel(&stream_id, &sender);

        // Sender tries to approve their own request (should fail)
        client.cancel_consensual(&stream_id, &sender);
    }

    #[test]
    #[should_panic(expected = "Requester must be sender or recipient")]
    fn test_request_cancel_fails_for_unauthorized_party() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(PaymentStreamContract, ());
        let client = PaymentStreamContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = Address::generate(&env);
        let unauthorized = Address::generate(&env);

        client.initialize(&admin);

        let stream_id = client.create_stream(&sender, &recipient, &token, &1000, &0, &100);

        // Unauthorized party tries to request cancellation (should fail)
        client.request_cancel(&stream_id, &unauthorized);
    }

    #[test]
    #[should_panic(expected = "Cancel request already pending")]
    fn test_request_cancel_fails_if_already_pending() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(PaymentStreamContract, ());
        let client = PaymentStreamContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = Address::generate(&env);

        client.initialize(&admin);

        let stream_id = client.create_stream(&sender, &recipient, &token, &1000, &0, &100);

        // First cancel request
        client.request_cancel(&stream_id, &sender);

        // Second cancel request (should fail)
        client.request_cancel(&stream_id, &recipient);
    }

    #[test]
    fn test_revoke_cancel_request() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(PaymentStreamContract, ());
        let client = PaymentStreamContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = Address::generate(&env);

        client.initialize(&admin);

        let stream_id = client.create_stream(&sender, &recipient, &token, &1000, &0, &100);

        // Sender requests cancellation
        client.request_cancel(&stream_id, &sender);

        // Verify cancel request exists
        assert!(client.get_cancel_request(&stream_id).is_some());

        // Sender revokes the request
        client.revoke_cancel_request(&stream_id, &sender);

        // Verify cancel request is removed
        assert!(client.get_cancel_request(&stream_id).is_none());

        // Verify stream is still active
        let stream = client.get_stream(&stream_id).unwrap();
        assert_eq!(stream.status, StreamStatus::Active);
    }

    #[test]
    #[should_panic(expected = "Only the original requester can revoke")]
    fn test_revoke_cancel_request_fails_for_wrong_party() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(PaymentStreamContract, ());
        let client = PaymentStreamContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = Address::generate(&env);

        client.initialize(&admin);

        let stream_id = client.create_stream(&sender, &recipient, &token, &1000, &0, &100);

        // Sender requests cancellation
        client.request_cancel(&stream_id, &sender);

        // Recipient tries to revoke (should fail)
        client.revoke_cancel_request(&stream_id, &recipient);
    }

    #[test]
    fn test_consensual_cancel_fund_distribution() {
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
        let stream_id = client.create_stream(&sender, &recipient, &token, &1000, &0, &100);

        // Sender requests cancellation
        client.request_cancel(&stream_id, &sender);

        // Move time to 25 seconds (25% vested = 250 tokens)
        env.ledger().set_timestamp(25);

        // Verify withdrawable amount before cancellation
        let withdrawable = client.withdrawable_amount(&stream_id);
        assert_eq!(withdrawable, 250);

        // Recipient approves cancellation
        // At this point:
        // - Recipient should receive 250 tokens (vested amount)
        // - Sender should receive 750 tokens (remaining)
        client.cancel_consensual(&stream_id, &recipient);

        // Verify stream is canceled
        let stream = client.get_stream(&stream_id).unwrap();
        assert_eq!(stream.status, StreamStatus::Canceled);

        // Note: Actual token transfers would need token contract integration
        // The amounts are emitted in the ConsensualCancel event
    }
}
