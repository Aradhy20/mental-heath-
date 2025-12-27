# 🗄️ MongoDB Cloud Setup Guide (Critical for Deployment)

You provided this connection string:
> `mongodb://localhost:27017/`

⛔ **STOP!** This connection string ONLY works on your laptop.
If you use this on Koyeb, Render, or Vercel, your app will **CRASH** immediately because "localhost" on the cloud refers to the cloud server, not your computer.

## ✅ How to Fix (Get a Free Cloud Database)

To make your app work on the internet, you need a Cloud Database.

### Step 1: Create Free Account
1.  Go to **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)**.
2.  Sign up (Free forever).

### Step 2: Create Cluster
1.  Click **+ Create**.
2.  Select **M0 Free** (Shared).
3.  Select **AWS** -> **Mumbai** (ap-south-1) for best speed in India.
4.  Click **Create Deployment**.

### Step 3: Create User
1.  It will ask to create a database user.
2.  Username: `admin` (or your choice).
3.  Password: **Create a strong password** and **SAVE IT**.
4.  Click **Create Database User**.

### Step 4: Network Access (Important!)
1.  It will ask "Where would you like to connect from?".
2.  Select **"Allow Access from Anywhere"** (0.0.0.0/0).
    *   *Why?* Because Koyeb/Render IPs change dynamically.
3.  Click **Add IP Entry**.

### Step 5: Get Connection String
1.  Click **Database** (left menu) -> **Connect**.
2.  Select **Drivers** (Python, Node, etc.).
3.  Copy the string. It looks like:
    `mongodb+srv://admin:<password>@cluster0.abcd.mongodb.net/?retryWrites=true&w=majority`
4.  **Replace `<password>`** with the actual password you created in Step 3.

## 🚀 Use THIS String for Deployment
When deploying to Koyeb or Render, whenever it asks for `MONGO_DETAILS`, paste this **`mongodb+srv://...`** string.

DO NOT use `localhost`.
