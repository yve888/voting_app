// src/App.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

// Your contract's ABI and address
const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_candidateId",
                "type": "uint256"
            }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "voter",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "candidateId",
                "type": "uint256"
            }
        ],
        "name": "Voted",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "candidates",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "voteCount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "candidatesCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_candidateId",
                "type": "uint256"
            }
        ],
        "name": "getVotes",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "hasVoted",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
const contractAddress = '0x6DE9729fAa662Ed978F3f7b55dFdBfC4aD77fA66';

function App() {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [hasVoted, setHasVoted] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadWeb3();
        loadBlockchainData();
    }, []);

    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        } else {
            alert('Please install MetaMask to use this DApp.');
        }
    };

    const loadBlockchainData = async () => {
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const votingContract = new web3.eth.Contract(contractABI, contractAddress);
        setContract(votingContract);

        const candidatesCount = await votingContract.methods.candidatesCount().call();
        let candidatesArray = [];
        for (let i = 1; i <= candidatesCount; i++) {
            const candidate = await votingContract.methods.candidates(i).call();
            candidatesArray.push(candidate);
        }
        setCandidates(candidatesArray);

        const voted = await votingContract.methods.hasVoted(accounts[0]).call();
        setHasVoted(voted);
    };

    const voteCandidate = async (candidateId) => {
        if (hasVoted) {
            setMessage('You have already voted.');
            return;
        }
        setMessage('Voting in progress...');
        try {
            await contract.methods.vote(candidateId).send({ from: account });
            setMessage('Vote successful!');
            setHasVoted(true);
        } catch (error) {
            setMessage('Voting failed. Please try again.');
            console.error(error);
        }
    };

    return (
        <div style={{ textAlign: 'center', fontFamily: 'Arial' }}>
            <h1>Decentralized Voting System</h1>
            <p>Account: {account ? account : 'Not connected'}</p>

            <div style={{ margin: '20px' }}>
                {candidates.map((candidate) => (
                    <div key={candidate.id} style={{ padding: '10px', border: '1px solid #ddd', margin: '10px auto', width: '50%' }}>
                        <h3>{candidate.name}</h3>
                        <p>Votes: {candidate.voteCount}</p>
                        <button
                            onClick={() => voteCandidate(candidate.id)}
                            disabled={hasVoted}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: hasVoted ? '#888' : '#4CAF50',
                                color: '#fff',
                                border: 'none',
                                cursor: hasVoted ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {hasVoted ? 'Already Voted' : 'Vote'}
                        </button>
                    </div>
                ))}
            </div>

            {message && <p style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
        </div>
    );
}

export default App;
