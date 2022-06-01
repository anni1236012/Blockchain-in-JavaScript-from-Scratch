# Create Blockchain from Scratch in JavaScript
# Follow on Twitter for any questions. 
# https://twitter.com/Anni_Maan

# The steps to run it correctly are listed below.
1. On your local machine, download or clone the repository.
2. Go to the local directory in VSCODE or any other IDE. For example, if you have this repository saved at C:/users/abc/desktop/anni maan
3. Run **npm install** from the anni maan directory. It will install all of the Project's essential dependencies.
5. You'll need a free MongoDB online atlas account. Simply create a user account. If you don't know how to make a mongoDB account, there are numerous YouTube videos available. 
6. You should now have an Url that you may use to connect to MongoDB on your local PC. 
7. You must generate two .env files, one in the anni **maan/Backend/**core**/.env** directory and the other in the **anni maan/Backend/**database**/.env** directory.
8. That's all there is to it; you should now be able to work on your projects.
9. **cd backend/core and make sure you're on anni maan.**
10. Dummy Private Key and Public Address is already hardcoded in core/Tx.Js file to receive the mining award. 
11. If you don't want to use the Dummy Private Key and Public address then you generate new Private Key and Public by running wallet.js script.
    Now you can update Tx.Js with the new Private Key and Public Address.
12. Start your Blockchain node by typing **node blockchain**
13. Voila! Your blockchain mining node is now up and running.

# Steps to Start Frontend 
1. cd frontend and create copy the .env file with database uri.
2. cd frontend and run npm install and then npm run dev. 
3. http://localhost:3000/
4. There 3 main sections, Blocks, Transfer and Mempool. 
5. Block is to see all the Blocks in our Blockchain.
6. Transfer is to send coins to any address. You can type any random intergers and it will automatically generate your Public Address. Make sure the from and to addresses are correct.
7. once you hit the Submit button, you should be able to see your transaction in mempool. Once Transaction is confirmed it will be automatically removed from the mempool.
8. You can goto back to blocks and one the block should have 2 transaction. First transaction will always be COINBASE transaction which is the mining reward and other transaction you just initiated.
9. You can click on any Transaction Id to see who sent you the coins.
10. You can also Click on the Public address to view the total balance and you the transaction you have received as far on this address. 

# What topics are covered in this Project
1. Fully Functional Blockchain
2. Create Transactions
3. Sign a Transaction
4. Validate a Transaction
5. Generate a Transaction from Multiple inputs
6. Broadcast Transactions
7. Memory Pool 
8. Listen for New Transactions and add them in a Block 
9. Mine a Block
10. Automatically remove transactions from Memory Pool that are included in a Block.
11. Automatically Adjust the Mining Difficulty 
12. Frontend to View all the Blocks in a Chronological Order
13. Create Transactions from the Frontend
14. As soon Transaction is created it will appear in Mempool.
15. Click on address to view the Total account Balance and complete Tx History. 
16. Click on any TxId to view in which block that transaction was included. 
