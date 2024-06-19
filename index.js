const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { Users, Products } = require("./config");
const bcrypt = require("bcrypt");
const { createJWT } = require("./utils/jwt");
const { createTokenUser } = require("./utils/createTokenUser");
const uploadMiddleware = require("./middlewares/multer");
const { authenticateToken } = require("./middlewares/auth");

const app = express();
const upload = uploadMiddleware.fields([
  { name: "cover", maxCount: 1 },
  { name: "gallery", maxCount: 3 },
]);

app.use(express.json());
app.use(cors());

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !password || !email) {
    return res.status(400).send("Email, username, and password are required");
  }

  try {
    const emailSnapshot = await Users.where("email", "==", email).get();
    if (!emailSnapshot.empty) {
      return res.status(400).send("Email already exists");
    }

    const usernameSnapshot = await Users.where(
      "username",
      "==",
      username
    ).get();
    if (!usernameSnapshot.empty) {
      return res.status(400).send("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await Users.add({
      email,
      username,
      password: hashedPassword,
    });

    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  try {
    const userSnapshot = await Users.where("username", "==", username).get();
    if (userSnapshot.empty) {
      return res.status(400).send("Invalid username or password");
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(400).send("Invalid username or password");
    }

    const token = createJWT({ payload: createTokenUser(userData) });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/products", authenticateToken, upload, async (req, res) => {
  try {
    const {
      brandName,
      ownerName,
      city,
      businessDescription,
      price,
      estimatedFund,
      estimatedDividend,
      companyVideo,
      instagram,
    } = req.body;

    const files = req.files;

    if (!files.cover || files.cover.length === 0) {
      return res.status(400).send("Cover image is required");
    }

    const coverFile = files.cover[0];
    const galleryFiles = files.gallery || [];

    const cover = {
      filename: coverFile.filename,
      originalname: coverFile.originalname,
      url: `/uploads/${coverFile.filename}`,
    };

    const gallery = galleryFiles.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      url: `/uploads/${file.filename}`,
    }));

    const productId = uuidv4();

    const newProduct = {
      id: productId,
      brandName,
      ownerName,
      city,
      businessDescription,
      price,
      estimatedFund,
      estimatedDividend,
      companyVideo,
      instagram,
      cover,
      gallery,
    };

    const docRef = await Products.add(newProduct);
    res.status(201).send(`Product added with ID: ${productId}`);
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.error(error);
  }
});

app.get("/products", authenticateToken, async (req, res) => {
  try {
    const snapshot = await Products.get();
    const products = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    res.json(products);
  } catch (error) {
    handleError(error, res);
  }
});

app.get("/products/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const productDoc = await Products.doc(id).get();
    console.log(productDoc)
    if (!productDoc.exists) {
      return res.status(404).send("Product not found");
    }
    res.json({ id: productDoc.id, ...productDoc.data() });
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.error(error);
  }
});

app.put("/products/:id", authenticateToken, upload, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      brandName,
      ownerName,
      city,
      businessDescription,
      price,
      estimatedFund,
      estimatedDividend,
      companyVideo,
      instagram,
    } = req.body;

    const existingProduct = await Products.doc(id).get();
    if (!existingProduct.exists) {
      return res.status(404).send("Product not found");
    }

    const files = req.files;

    const gallery = files.gallery
      ? files.gallery.map((file) => ({
          filename: file.filename,
          originalname: file.originalname,
          url: `/uploads/${file.filename}`,
        }))
      : existingProduct.data().gallery;

    let updatedProduct = {
      brandName,
      ownerName,
      city,
      businessDescription,
      price,
      estimatedFund,
      estimatedDividend,
      companyVideo,
      instagram,
      gallery,
    };

    if (files.cover && files.cover.length > 0) {
      const coverFile = files.cover[0];
      updatedProduct.cover = {
        filename: coverFile.filename,
        originalname: coverFile.originalname,
        url: `/uploads/${coverFile.filename}`,
      };
    }

    await Products.doc(id).update(updatedProduct);
    res.send(`Product with ID: ${id} has been updated`);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/products/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await Products.doc(id).delete();
    res.send(`Product with ID: ${id} has been deleted`);
  } catch (error) {
    handleError(error, res);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
