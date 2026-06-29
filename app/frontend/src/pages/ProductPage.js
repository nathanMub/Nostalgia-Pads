import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Star, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { ProductCard } from '@/components/ProductCard';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ProductPage = () => {
  const { slug } = useParams();
  const { addToCart, loading: cartLoading } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);
    setProduct(null);
    setRelatedProducts([]);
    setSelectedImage(0);
    setSelectedSize('');

    fetchProductData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchProductData = async () => {
    try {
      const productRes = await axios.get(`${API}/products/${slug}`);
      const data = productRes.data;

      setProduct(data);

      const sizes = data.size_options || [];
      if (sizes.length > 0) setSelectedSize(sizes[0]);

      // fetch related safely
      const relatedRes = await axios.get(
        `${API}/products?collection_id=${data.collection_id}`
      );

      const filtered = (relatedRes.data || [])
        .filter(p => p.id !== data.id)
        .slice(0, 3);

      setRelatedProducts(filtered);
    } catch (err) {
      console.error(err);
      setError('Failed to load product');
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    try {
      await addToCart(product, selectedSize, 1);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/" className="text-purple-500">Go back home</Link>
        </div>
      </div>
    );
  }

  const productImages =
    product.images?.length > 0
      ? product.images
      : product.image_url
      ? [product.image_url]
      : [];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Images */}
          <div className="space-y-4">
            <Zoom>
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100">
                {productImages[selectedImage] && (
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </Zoom>

            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-lg overflow-hidden border ${
                      selectedImage === i
                        ? 'border-purple-500'
                        : 'border-transparent'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">

            <h1 className="text-3xl font-bold">{product.name}</h1>

            <div className="flex items-center gap-2">
              <Star className="text-yellow-500 w-5 h-5" />
              <span>{product.rating || 0}</span>
              <span className="text-slate-500">
                ({product.reviews_count || 0})
              </span>
            </div>

            <div className="text-3xl font-bold">
              ${product.price}
            </div>

            {/* Sizes */}
            <div>
              <h3 className="font-semibold mb-2">Size</h3>
              <div className="flex gap-2 flex-wrap">
                {(product.size_options || []).map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-full border ${
                      selectedSize === size
                        ? 'bg-purple-500 text-white'
                        : ''
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={cartLoading}
              className="w-full py-3 bg-purple-500 text-white rounded-full"
            >
              {cartLoading ? 'Adding...' : 'Add to Cart'}
            </button>

            <p className="text-slate-600">{product.description}</p>

            <ul className="space-y-2">
              {[
                'Premium surface',
                'Non-slip base',
                'Durable stitching',
                'Easy cleaning',
                'High-quality print'
              ].map((f, i) => (
                <li key={i} className="flex gap-2">
                  <Check className="text-green-500 w-4 h-4" />
                  {f}
                </li>
              ))}
            </ul>

          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold mb-6">You may also like</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
