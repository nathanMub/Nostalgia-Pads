app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { paypal_order_id, order_id } = req.body;

    const capture = await paypalClient.capture(paypal_order_id);

    await db.orders.update(order_id, {
      status: 'paid',
      payment_data: capture
    });

    // 🧹 CLEAR CART AFTER SUCCESSFUL PAYMENT
    const order = await db.orders.findById(order_id);
    await db.cart.clear(order.cart_id);

    res.json({ success: true });

  } catch (err) {
    console.error('Capture error:', err);
    res.status(500).json({ error: 'Payment capture failed' });
  }
});
