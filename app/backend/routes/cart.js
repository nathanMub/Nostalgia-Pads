app.post('/api/cart/:cartId/add', async (req, res) => {
  try {
    const { cartId } = req.params;
    const { product_id, size, quantity } = req.body;

    // 🔒 ALWAYS FETCH PRODUCT FROM DB (DO NOT TRUST FRONTEND PRICE)
    const product = await db.products.findById(product_id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const price = product.price;

    const updatedCart = await db.cart.addItem(cartId, {
      product_id,
      size,
      quantity,
      price
    });

    res.json(updatedCart);

  } catch (err) {
    console.error('Cart add error:', err);
    res.status(500).json({ error: 'Cart add failed' });
  }
});
