"use client"

import { supabase } from "@/lib/supabase"
import { logUsage } from "@/services/analytics"

export type HydrogenComponentType =
  | "product-card"
  | "collection-list"
  | "cart"
  | "product-details"
  | "navigation"
  | "footer"
  | "hero"

export interface HydrogenComponentOptions {
  type: HydrogenComponentType
  customizations?: Record<string, any>
  storeId?: string
}

export async function generateHydrogenComponent(options: HydrogenComponentOptions) {
  // Log usage of the Hydrogen component generator
  await logUsage("generate_hydrogen_component", "hydrogen", undefined, {
    component_type: options.type,
    has_customizations: !!options.customizations,
  })

  // In a real implementation, this would call an AI service to generate the component
  // For now, we'll return template code based on the component type
  const componentCode = getHydrogenComponentTemplate(options.type, options.customizations)

  return {
    code: componentCode,
    type: options.type,
  }
}

export async function saveHydrogenComponent(userId: string, projectId: string, componentName: string, code: string) {
  const { data, error } = await supabase
    .from("project_files")
    .insert({
      project_id: projectId,
      name: componentName,
      path: `/components/${componentName}.jsx`,
      content: code,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving Hydrogen component:", error)
    throw error
  }

  return data
}

function getHydrogenComponentTemplate(type: HydrogenComponentType, customizations?: Record<string, any>): string {
  switch (type) {
    case "product-card":
      return `import {Link, Image, Money} from '@shopify/hydrogen';

export function ProductCard({product}) {
  const {priceV2: price, compareAtPriceV2: compareAtPrice} = product.variants?.nodes[0] || {};
  const isOnSale = compareAtPrice?.amount > price?.amount;

  return (
    <Link to={\`/products/\${product.handle}\`} className="group">
      <div className="overflow-hidden rounded-lg">
        <Image 
          data={product.featuredImage} 
          alt={product.title}
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
        />
        {isOnSale && (
          <div className="absolute top-2 right-2 bg-shopify-green text-white text-xs px-2 py-1 rounded">
            Sale
          </div>
        )}
      </div>
      <h3 className="mt-3 text-lg font-medium">{product.title}</h3>
      <div className="flex items-center mt-1">
        <Money withoutTrailingZeros data={price} />
        {isOnSale && (
          <Money 
            withoutTrailingZeros 
            data={compareAtPrice} 
            className="ml-2 line-through text-gray-500 text-sm" 
          />
        )}
      </div>
    </Link>
  );
}`
    case "cart":
      return `import {useCart, CartLineProvider, Money, Link, Image} from '@shopify/hydrogen';
import {useEffect} from 'react';

export function Cart() {
  const {lines, totalQuantity, cost, checkoutUrl} = useCart();
  
  const isEmpty = totalQuantity === 0;
  
  useEffect(() => {
    // Track cart viewed event
    if (window.plausible && totalQuantity > 0) {
      window.plausible('Cart Viewed', {
        props: {
          total_items: totalQuantity,
          total_value: cost?.totalAmount?.amount
        }
      });
    }
  }, [totalQuantity, cost]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        Your Cart
        {!isEmpty && (
          <span className="ml-2 text-sm bg-gray-200 px-2 py-1 rounded-full">
            {totalQuantity}
          </span>
        )}
      </h2>
      
      {isEmpty ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-6">Your cart is empty</p>
          <Link 
            to="/collections/all" 
            className="bg-shopify-green text-white px-6 py-3 rounded-lg inline-block hover:bg-shopify-dark-green transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 mb-6">
            {lines.map((line) => (
              <CartLineItem key={line.id} line={line} />
            ))}
          </ul>
          
          <div className="flex justify-between items-center font-medium text-lg mb-6">
            <span>Subtotal</span>
            <Money data={cost?.subtotalAmount} />
          </div>
          
          <p className="text-gray-500 text-sm mb-6">
            Shipping and taxes calculated at checkout
          </p>
          
          <a 
            href={checkoutUrl}
            className="w-full bg-shopify-green text-white py-3 px-6 rounded-lg text-center block font-medium hover:bg-shopify-dark-green transition-colors"
          >
            Proceed to Checkout
          </a>
        </>
      )}
    </div>
  );
}

function CartLineItem({line}) {
  const {merchandise, quantity} = line;
  
  return (
    <CartLineProvider line={line}>
      <li className="py-4 flex">
        <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden">
          <Image 
            data={merchandise.image} 
            alt={merchandise.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="ml-4 flex-1 flex flex-col">
          <div className="flex justify-between">
            <div>
              <h3 className="font-medium">{merchandise.product.title}</h3>
              <p className="text-sm text-gray-500">{merchandise.title}</p>
            </div>
            <Money data={line.cost.totalAmount} />
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center border rounded">
              <button 
                className="px-3 py-1 text-gray-600 hover:text-black"
                onClick={() => updateCartLine(line.id, quantity - 1)}
              >
                -
              </button>
              <span className="px-3 py-1 border-x">{quantity}</span>
              <button 
                className="px-3 py-1 text-gray-600 hover:text-black"
                onClick={() => updateCartLine(line.id, quantity + 1)}
              >
                +
              </button>
            </div>
            
            <button 
              className="text-sm text-red-600 hover:text-red-800"
              onClick={() => removeFromCart(line.id)}
            >
              Remove
            </button>
          </div>
        </div>
      </li>
    </CartLineProvider>
  );
}

function updateCartLine(lineId, quantity) {
  // This would be implemented with useCartLine hook in a real component
  console.log('Update quantity', lineId, quantity);
}

function removeFromCart(lineId) {
  // This would be implemented with useCart hook in a real component
  console.log('Remove from cart', lineId);
}`
    case "product-details":
      return `import {
  ProductProvider,
  useProduct,
  ProductPrice,
  AddToCartButton,
  BuyNowButton,
  Image
} from '@shopify/hydrogen';

export function ProductDetails({product}) {
  return (
    <ProductProvider data={product}>
      <div className="grid md:grid-cols-2 gap-8 py-8">
        <ProductGallery />
        <ProductInfo />
      </div>
    </ProductProvider>
  );
}

function ProductGallery() {
  const {media, title} = useProduct();
  
  if (!media.length) {
    return null;
  }

  return (
    <div className="sticky top-24">
      <div className="aspect-square rounded-lg overflow-hidden">
        <Image 
          data={media[0].image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {media.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {media.map((med, i) => (
            <div 
              key={med.id || i}
              className="aspect-square rounded-md overflow-hidden border hover:border-shopify-green cursor-pointer"
            >
              <Image 
                data={med.image}
                alt={\`\${title} - View \${i + 1}\`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductInfo() {
  const {
    title,
    descriptionHtml,
    selectedVariant,
  } = useProduct();
  
  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold">{title}</h1>
      
      <div className="mt-4">
        <ProductPrice 
          data={selectedVariant}
          priceClassName="text-2xl font-medium"
          compareAtPriceClassName="text-gray-500 line-through ml-2"
        />
      </div>
      
      <div 
        className="prose prose-sm mt-6"
        dangerouslySetInnerHTML={{__html: descriptionHtml}}
      />
      
      <VariantSelector />
      
      <div className="mt-8 space-y-4">
        <AddToCartButton 
          variantId={selectedVariant?.id}
          quantity={1}
          className="w-full bg-shopify-green text-white py-3 px-6 rounded-lg text-center block font-medium hover:bg-shopify-dark-green transition-colors"
        >
          Add to Cart
        </AddToCartButton>
        
        <BuyNowButton 
          variantId={selectedVariant?.id}
          quantity={1}
          className="w-full bg-black text-white py-3 px-6 rounded-lg text-center block font-medium hover:bg-gray-800 transition-colors"
        >
          Buy Now
        </BuyNowButton>
      </div>
    </div>
  );
}

function VariantSelector() {
  const {
    options,
    selectedOptions,
    setSelectedOption,
  } = useProduct();
  
  if (!options.length) {
    return null;
  }

  return (
    <div className="mt-6">
      {options.map((option) => (
        <div key={option.name} className="mb-4">
          <h3 className="text-sm font-medium mb-2">{option.name}</h3>
          
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const checked = selectedOptions[option.name] === value;
              
              return (
                <label 
                  key={value}
                  className={\`
                    px-4 py-2 border rounded-lg cursor-pointer text-sm
                    \${checked ? 'border-shopify-green bg-shopify-green/10' : 'border-gray-300 hover:border-gray-400'}
                  \`}
                >
                  <input
                    type="radio"
                    name={option.name}
                    value={value}
                    checked={checked}
                    onChange={() => setSelectedOption(option.name, value)}
                    className="sr-only"
                  />
                  {value}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}`
    default:
      return `// ${type} component template
// This is a placeholder for the ${type} component
// In a real implementation, this would be generated based on your requirements

import {Link} from '@shopify/hydrogen';

export function ${type
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("")}() {
  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">${type
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")}</h2>
      <p>This is a placeholder for the ${type} component.</p>
      <Link to="/" className="text-shopify-green hover:underline">Back to home</Link>
    </div>
  );
}`
  }
}
