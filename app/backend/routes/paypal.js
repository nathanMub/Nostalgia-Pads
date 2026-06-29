app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const { order_id } = req.body;

    const order = await db.orders.findById(order_id);
    const items = await db.cart.getItems(order.cart_id);

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // 🔒 SERVER CALCULATED TOTAL (NO FRONTEND TRUST)
    const total = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const paypalOrder = await paypalClient.createOrder({
      amount: total
    });

    res.json({ id: paypalOrder.id });

  } catch (err) {
    console.error('PayPal create error:', err);
    res.status(500).json({ error: 'PayPal order failed' });
  }
});
