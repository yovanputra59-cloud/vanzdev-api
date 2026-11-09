const express = require('express');
const app = express();
app.use(express.json());

// Database user - hanya owner yang bisa tambah
const OWNER_KEY = "vanzdev-owner-2024";

let users = {
    "vanzman": {
        password: "pass123",
        expired: "2025-12-31",
        status: "active"
    }
};

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (!user) return res.status(404).json({ status: false, msg: "User tidak ditemukan" });
    if (user.password !== password) return res.status(401).json({ status: false, msg: "Password salah" });
    if (user.status !== "active") return res.status(403).json({ status: false, msg: "Akun tidak aktif" });
    const now = new Date();
    const exp = new Date(user.expired);
    if (now > exp) return res.status(403).json({ status: false, msg: "Akun expired" });
    res.json({ status: true, msg: "Login berhasil", expired: user.expired });
});

// Tambah user - hanya owner
app.post('/adduser', (req, res) => {
    const { owner_key, username, password, expired } = req.body;
    if (owner_key !== OWNER_KEY) return res.status(403).json({ status: false, msg: "Bukan owner" });
    if (users[username]) return res.status(400).json({ status: false, msg: "User sudah ada" });
    users[username] = { password, expired, status: "active" };
    res.json({ status: true, msg: "User ditambahkan", username, expired });
});

// Hapus user - hanya owner
app.delete('/deluser', (req, res) => {
    const { owner_key, username } = req.body;
    if (owner_key !== OWNER_KEY) return res.status(403).json({ status: false, msg: "Bukan owner" });
    if (!users[username]) return res.status(404).json({ status: false, msg: "User tidak ditemukan" });
    delete users[username];
    res.json({ status: true, msg: "User dihapus" });
});

// Cek user
app.get('/cek', (req, res) => {
    const { key } = req.query;
    if (key !== OWNER_KEY) return res.status(403).json({ status: false, msg: "Bukan owner" });
    res.json({ status: true, users: Object.keys(users).map(u => ({ username: u, expired: users[u].expired, status: users[u].status })) });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`VANZDEV API running on port ${PORT}`));
