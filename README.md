# Create Blockchain from Scratch in JavaScript
# Follow on Twitter for any questions.
# https://twitter.com/Anni_Maan
![image](https://user-images.githubusercontent.com/86418669/171509218-82bbee01-25a6-4720-993e-290944510f7f.png)
# What topics are covered in this Project
1. Fully Functional Blockchain
2. Create a Wallet
3. Create Transactions
4. Sign a Transaction
5. Validate a Transaction
6. Generate a Transaction from Multiple inputs
7. Broadcast Transactions
8. Memory Pool 
9. Listen for New Transactions and add them in a Block 
10. Mine a Block
11. Automatically remove transactions from Memory Pool that are included in a Block.
12. Automatically Adjust the Mining Difficulty 
13. Frontend to View all the Blocks in a Chronological Order
14. Create Transactions from the Frontend
15. As soon Transaction is created it will appear in Mempool.
16. Click on address to view the Total account Balance and complete Tx History. 
17. Click on any TxId to view in which block that transaction was included. 

![image](https://user-images.githubusercontent.com/86418669/171509272-a3e16187-cf5a-4c77-83e9-5dc3c58ef4c7.png)

# The steps to run it correctly are listed below.
1. On your local machine, download or clone the repository.
2. Go to the local directory in VSCODE or any other IDE. For example, if you have this repository saved at C:/users/abc/desktop/anni maan
3. Run **npm install** from the anni maan directory. It will install all of the Project's essential dependencies.
5. You'll need a free MongoDB online atlas account. Simply create a user account. If you don't know how to make a mongoDB account, there are numerous YouTube videos available.
6. You should now have an Url that you may use to connect to MongoDB on your local PC. 
7. You must generate two .env files, one in the anni **maan/Backend/**core**/.env** directory and the other in the **anni maan/Backend/**database**/.env** directory.
8. That's all there is to it; you should now be able to work on your projects.
9. **cd backend/core and make sure you're on anni maan.**
11. Dummy Private Key and Public Address is already hardcoded in core/Tx.Js file to receive the mining award. 
12. If you don't want to use the Dummy Private Key and Public address then you generate new Private Key and Public by running wallet.js script.
    Now you can update Tx.Js with the new Private Key and Public Address.
12. Start your Blockchain node by typing **node blockchain**
13. Voila! Your blockchain mining node is now up and running.
![image](https://user-images.githubusercontent.com/86418669/171509312-7e7da276-1a97-4e4c-8593-5def0328af83.png)

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
![image](https://user-images.githubusercontent.com/86418669/171509341-26d80c58-9cf7-438a-9cb9-6e5528d42864.png)
