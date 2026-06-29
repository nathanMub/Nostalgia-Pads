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

  useEffect(() => {
    if (slug) fetchProductData();
  }, [slug]);

  const fetchProductData = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API}/products/${slug}`);
      const data = res.data;

      setProduct(data);

      // SAFE size options
      const sizes = Array.isArray(data?.size_options) ? data.size_options : [];
      setSelectedSize(sizes[0] || '');

      // Fetch related safely
      const relatedRes = await axios.get(
        `${API}/products?collection_id=${data.collection_id}`
      );

      const filtered = Array.isArray(relatedRes.data)
        ? relatedRes.data.filter(p => p.id !== data.id).slice(0, 3)
        : [];

      setRelatedProducts(filtered);

    } catch (err) {
      console.error('Product load error:', err);
      toast.error('Failed to load product');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
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
        <div className="animate-spin h-12 w-12 border-b-2 border-purple-500 rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/" className="text-purple-500">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const productImages =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images
      : product?.image_url
      ? [product.image_url]
      : [];

  const sizes = Array.isArray(product?.size_options)
    ? product.size_options
    : [];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <Link to="/" className="flex items-center gap-2 mb-8 text-slate-500">
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* IMAGES */}
          <div>
            <Zoom>
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                {productImages.length > 0 && (
                  <img
                    src={productImages[selectedImage]}
                    alt={product?.name || 'Product'}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </Zoom>

            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === i
                        ? 'border-purple-500'
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`view-${i}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="space-y-6">

            <h1 className="text-4xl font-black">
              {product?.name || 'Unnamed Product'}
            </h1>

            <div className="flex items-center gap-2 text-yellow-500">
              <Star className="w-5 h-5 fill-current" />
              <span>{product?.rating || 0}</span>
              <span className="text-slate-400">
                ({product?.reviews_count || 0})
              </span>
            </div>

            <div className="text-4xl font-black">
              ${product?.price || 0}
            </div>

            {/* SIZES */}
            <div>
              <h3 className="font-bold mb-2">Size</h3>
              <div className="flex gap-2 flex-wrap">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2 rounded-full ${
                      selectedSize === size
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800'
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
              className="w-full py-4 bg-purple-500 text-white font-bold rounded-full"
            >
              {cartLoading ? 'Adding...' : 'Add to Cart'}
            </button>

            {/* DESCRIPTION */}
            <p className="text-slate-500">
              {product?.description || 'No description available.'}
            </p>

            {/* FEATURES */}
            <ul className="space-y-2 text-slate-500">
              {[
                'Smooth surface for precision',
                'Anti-slip rubber base',
                'Durable stitched edges',
                'Fade-resistant print'
              ].map((f, i) => (
                <li key={i} className="flex gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RELATED */}
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
