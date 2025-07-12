import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  CreditCard,
  Coffee,
  ChefHat,
  AlertCircle,
  BarChart3,
  PieChart,
  Filter,
  Download,
  RefreshCw,
  Receipt,
  Percent,
  Building2,
  Store,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Sample data - in real app this would come from an API
const sampleData = [
  {
    "_id": { "$oid": "6862f8b253405eb33e195617" },
    "brand_id": { "$oid": "6828c5fd56c533c8f2ec74ad" },
    "outlet_id": { "$oid": "6828c83956c533c8f2ec74bb" },
    "createdAt": { "$date": "2025-06-30T20:50:58.562Z" },
    "posInfo": {
      "timezone": {
        "label": "(UTC-05:00) Eastern Time (Canada)",
        "value": "America/Toronto"
      },
      "_id": "6828c83956c533c8f2ec74bb",
      "brand_id": "6828c5fd56c533c8f2ec74ad",
      "name": "Sector 17 Test",
      "code": "1234",
      "email": "hisar@sector17.com",
      "phone": "9310957577",
      "country_code": "+91",
      "opening_time": "01:10",
      "closing_time": "12:50",
      "website": "https://sector17.ca/",
      "street": "H. No. 659-A",
      "city": "Hisar",
      "state": "Haryana",
      "country": "Canada",
      "postal_code": "125001",
      "status": "active",
      "createdAt": "2025-05-17T17:32:41.649Z",
      "updatedAt": "2025-06-13T18:36:52.446Z",
      "__v": 0
    },
    "outletInfo": {
      "id": "day_1751298701002_216",
      "openTime": 1.751298701001e12,
      "openingCash": "12312",
      "comment": "sadf",
      "openByStaff": {
        "staff_id": "6828c99764906addfe30ba39",
        "name": "CEO Parul",
        "pos_login_pin": "1234",
        "role_name": "Admin",
        "isLoggedIn": true
      },
      "closeTime": 1.751298704855e12,
      "closingComment": "asfsa",
      "closeByStaff": {
        "staff_id": "6828c99764906addfe30ba39",
        "name": "CEO Parul",
        "pos_login_pin": "1234",
        "role_name": "Admin",
        "isLoggedIn": true
      }
    },
    "staffInfo": [
      {
        "staff_id": "6828c99764906addfe30ba39",
        "name": "CEO Parul",
        "role_name": "Admin"
      },
      {
        "staff_id": "6828c5fd56c533c8f2ec74b0",
        "name": "Karan Rao",
        "role_name": "Admin"
      },
      {
        "staff_id": "6828c9c964906addfe30ba45",
        "name": "Sahil",
        "role_name": "Manager"
      }
    ],
    "punchIns": [
      {
        "day_id": "day_1751298701002_216",
        "user_id": "6828c99764906addfe30ba39",
        "shift_id": "punch_1751298701698_211",
        "punch_in": 1.75129866e12,
        "punch_out": 1.751298704855e12,
        "breaks": []
      }
    ],
    "orders": [],
    "__v": 0
  },
  {
    "_id": { "$oid": "6862f8b253405eb33e195619" },
    "brand_id": { "$oid": "6828c5fd56c533c8f2ec74ad" },
    "outlet_id": { "$oid": "6828c83956c533c8f2ec74bb" },
    "createdAt": { "$date": "2025-06-30T20:50:58.644Z" },
    "posInfo": {
      "timezone": {
        "label": "(UTC-05:00) Eastern Time (Canada)",
        "value": "America/Toronto"
      },
      "_id": "6828c83956c533c8f2ec74bb",
      "brand_id": "6828c5fd56c533c8f2ec74ad",
      "name": "Sector 17 Test",
      "code": "1234",
      "email": "hisar@sector17.com",
      "phone": "9310957577",
      "country_code": "+91",
      "opening_time": "01:10",
      "closing_time": "12:50",
      "website": "https://sector17.ca/",
      "street": "H. No. 659-A",
      "city": "Hisar",
      "state": "Haryana",
      "country": "Canada",
      "postal_code": "125001",
      "status": "active",
      "createdAt": "2025-05-17T17:32:41.649Z",
      "updatedAt": "2025-06-13T18:36:52.446Z",
      "__v": 0
    },
    "outletInfo": {
      "id": "day_1751298725555_956",
      "openTime": 1.751298725554e12,
      "openingCash": "123",
      "closingCash": 1234,
      "comment": "szdffds",
      "openByStaff": {
        "staff_id": "6828c99764906addfe30ba39",
        "name": "CEO Parul",
        "pos_login_pin": "1234",
        "role_name": "Admin",
        "isLoggedIn": true
      },
      "closeTime": 1.751316665573e12,
      "closingComment": "asdfsadf",
      "closeByStaff": {
        "staff_id": "6828c99764906addfe30ba39",
        "name": "CEO Parul",
        "pos_login_pin": "1234",
        "role_name": "Admin",
        "isLoggedIn": true
      }
    },
    "staffInfo": [
      {
        "staff_id": "6828c99764906addfe30ba39",
        "name": "CEO Parul",
        "role_name": "Admin"
      },
      {
        "staff_id": "6828c5fd56c533c8f2ec74b0",
        "name": "Karan Rao",
        "role_name": "Admin"
      },
      {
        "staff_id": "6828c9c964906addfe30ba45",
        "name": "Sahil",
        "role_name": "Manager"
      }
    ],
    "punchIns": [
      {
        "day_id": "day_1751298725555_956",
        "user_id": "6828c99764906addfe30ba39",
        "shift_id": "punch_1751298726309_767",
        "punch_in": 1.75129872e12,
        "punch_out": 1.751316665573e12,
        "breaks": []
      }
    ],
    "orders": [
      {
        "id": "order_1751301187651_953",
        "orderType": {
          "_id": "6828ca1364906addfe30ba50",
          "name": "Pick Up",
          "category": "pickup",
          "status": "active",
          "brand_id": "6828c5fd56c533c8f2ec74ad",
          "outlet_id": "6828c83956c533c8f2ec74bb",
          "createdAt": "2025-05-17T17:40:35.208Z",
          "updatedAt": "2025-06-06T08:40:43.157Z",
          "__v": 0,
          "isActive": true
        },
        "status": "refund",
        "dayInfo": {
          "id": "day_1751298725555_956",
          "openingCash": "123",
          "openTime": 1.751298725554e12,
          "comment": "szdffds",
          "openBy": "6828c99764906addfe30ba39"
        },
        "items": [
          {
            "_id": "6855a7e167609f4db1779ba9",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetizers",
            "name": "Fries - medium",
            "price": 5.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.046Z",
            "updatedAt": "2025-06-20T18:26:41.046Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 5.99
          }
        ],
        "summary": {
          "subtotal": 5.99,
          "discount": 0,
          "coupon": 0,
          "additionalCharges": 0,
          "tax": 0.7188,
          "total": 6.7088
        },
        "customer": { "name": "fhgj" },
        "counterStaff": {
          "staff_id": "6828c99764906addfe30ba39",
          "name": "CEO Parul",
          "pos_login_pin": "1234",
          "role_name": "Admin",
          "isLoggedIn": true
        },
        "kds_at": [1.751301337842e12],
        "paymentInfo": {
          "orderTotal": 6.71,
          "tip": 0,
          "grandTotal": 6.71,
          "totalPaid": 6.71,
          "remaining": 0,
          "return": 0,
          "reference": "",
          "payments": [
            {
              "typeId": "6828ca3364906addfe30ba63",
              "typeName": "Card",
              "amount": 6.71
            }
          ]
        },
        "counterStaffAtRefund": {
          "staff_id": "6828c99764906addfe30ba39",
          "name": "CEO Parul",
          "pos_login_pin": "1234",
          "role_name": "Admin",
          "isLoggedIn": true
        },
        "refundReason": "rty",
        "refund_at": 1.751312165995e12,
        "refundAmount": 6.71
      },
      {
        "id": "order_1751303353903_771",
        "orderType": {
          "_id": "6828ca1364906addfe30ba50",
          "name": "Pick Up",
          "category": "pickup",
          "status": "active",
          "brand_id": "6828c5fd56c533c8f2ec74ad",
          "outlet_id": "6828c83956c533c8f2ec74bb",
          "createdAt": "2025-05-17T17:40:35.208Z",
          "updatedAt": "2025-06-06T08:40:43.157Z",
          "__v": 0,
          "isActive": true
        },
        "status": "settle",
        "dayInfo": {
          "id": "day_1751298725555_956",
          "openingCash": "123",
          "openTime": 1.751298725554e12,
          "comment": "szdffds",
          "openBy": "6828c99764906addfe30ba39"
        },
        "items": [
          {
            "_id": "6855a7e167609f4db1779ba9",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetizers",
            "name": "Fries - medium",
            "price": 5.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.046Z",
            "updatedAt": "2025-06-20T18:26:41.046Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 5.99
          },
          {
            "_id": "6855a7e167609f4db1779c58",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Sandwich",
            "name": "Nutells sandwich",
            "price": 2.49,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.167Z",
            "updatedAt": "2025-06-20T18:26:41.167Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 2.49
          },
          {
            "_id": "6855a7e167609f4db1779c53",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Sandwich",
            "name": "Chicken grilled sandwich",
            "price": 8.49,
            "food_type": "non-veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.164Z",
            "updatedAt": "2025-06-20T18:26:41.164Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 8.49
          },
          {
            "_id": "6855a7e167609f4db1779d2a",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Shakes",
            "name": "Butterscoth Falooda",
            "price": 7.99,
            "food_type": "other",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.306Z",
            "updatedAt": "2025-06-20T18:26:41.306Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 7.99
          },
          {
            "_id": "6855a7e167609f4db1779d0c",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Shakes",
            "name": "Butterscotch Shake",
            "price": 7.49,
            "food_type": "other",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.288Z",
            "updatedAt": "2025-06-20T18:26:41.288Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 7.49
          },
          {
            "_id": "6855a7e167609f4db1779da1",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "promotions",
            "name": "Fried rice with gravy combo",
            "price": 7.99,
            "food_type": "other",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.383Z",
            "updatedAt": "2025-06-20T18:26:41.383Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 7.99
          },
          {
            "_id": "6855a7e167609f4db1779d7e",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "promotions",
            "name": "Burger employee meal",
            "price": 0,
            "food_type": "other",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.359Z",
            "updatedAt": "2025-06-20T18:26:41.359Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 0
          },
          {
            "_id": "6855a7e167609f4db1779bf8",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "momos",
            "name": "Chicken fried momos",
            "price": 13.99,
            "food_type": "non-veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.098Z",
            "updatedAt": "2025-06-20T18:26:41.098Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 13.99
          },
          {
            "_id": "6855a7e167609f4db1779bfd",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "momos",
            "name": "Chicken chilli momos",
            "price": 13.99,
            "food_type": "non-veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.102Z",
            "updatedAt": "2025-06-20T18:26:41.102Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 13.99
          },
          {
            "_id": "6855a7e167609f4db1779c0e",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "burgers",
            "name": "Aloo tikki noodle burger",
            "price": 8.49,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.116Z",
            "updatedAt": "2025-06-20T18:26:41.116Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 8.49
          },
          {
            "_id": "6855a7e167609f4db1779c13",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "burgers",
            "name": "Aloo tikki salad burger",
            "price": 7.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.119Z",
            "updatedAt": "2025-06-20T18:26:41.119Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 7.99
          },
          {
            "_id": "6855a7e167609f4db1779c3d",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Wraps",
            "name": "Butter chicken wrap",
            "price": 10.49,
            "food_type": "non-veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.150Z",
            "updatedAt": "2025-06-20T18:26:41.150Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 10.49
          },
          {
            "_id": "6855a7e167609f4db1779c29",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Wraps",
            "name": "Butter paneer wrap",
            "price": 10.49,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.137Z",
            "updatedAt": "2025-06-20T18:26:41.137Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 10.49
          },
          {
            "_id": "6855a7e167609f4db1779c64",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Soup",
            "name": "Tomato soup",
            "price": 5.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.174Z",
            "updatedAt": "2025-06-20T18:26:41.174Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 5.99
          },
          {
            "_id": "6855a7e167609f4db1779d74",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Chaat House",
            "name": "Gol Gappe",
            "price": 7.99,
            "food_type": "other",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.352Z",
            "updatedAt": "2025-06-20T18:26:41.352Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 7.99
          },
          {
            "_id": "6855a7e167609f4db1779d79",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Chaat House",
            "name": "Dahi puri",
            "price": 8.99,
            "food_type": "other",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.355Z",
            "updatedAt": "2025-06-20T18:26:41.355Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 8.99
          },
          {
            "_id": "6855a7e167609f4db1779bb0",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetrizers",
            "name": "Fries - large",
            "price": 7.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.050Z",
            "updatedAt": "2025-06-20T18:26:41.050Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 7.99
          },
          {
            "_id": "6855a7e167609f4db1779bce",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetrizers",
            "name": "2pcs chicken and fries combo",
            "price": 9.99,
            "food_type": "non-veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.073Z",
            "updatedAt": "2025-06-20T18:26:41.073Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 9.99
          },
          {
            "_id": "6855a7e167609f4db1779bbf",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetrizers",
            "name": "Veg spring rolls large",
            "price": 11.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.061Z",
            "updatedAt": "2025-06-20T18:26:41.061Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 11.99
          },
          {
            "_id": "6855a7e167609f4db1779bb5",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetrizers",
            "name": "Masala fries",
            "price": 10.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.054Z",
            "updatedAt": "2025-06-20T18:26:41.054Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 10.99
          },
          {
            "_id": "6855a7e167609f4db1779bc9",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetrizers",
            "name": "noodle spring roll large (6pcs)",
            "price": 11.48,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.070Z",
            "updatedAt": "2025-06-20T18:26:41.070Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 11.48
          },
          {
            "_id": "6855a7e167609f4db1779bba",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetrizers",
            "name": "Veg spring rolls medium",
            "price": 7.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.057Z",
            "updatedAt": "2025-06-20T18:26:41.057Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 7.99
          },
          {
            "_id": "6855a7e167609f4db1779bc4",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetrizers",
            "name": "noodle spring roll medium (3pcs)",
            "price": 5.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.066Z",
            "updatedAt": "2025-06-20T18:26:41.066Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 5.99
          },
          {
            "_id": "6855a7e167609f4db1779d59",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Dessert",
            "name": "Butterscotch Ice cream",
            "price": 4.99,
            "food_type": "other",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.336Z",
            "updatedAt": "2025-06-20T18:26:41.336Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 4.99
          },
          {
            "_id": "6855a7e167609f4db1779d40",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Dessert",
            "name": "Black current fruit cream",
            "price": 5.49,
            "food_type": "other",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.319Z",
            "updatedAt": "2025-06-20T18:26:41.319Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 5.49
          },
          {
            "_id": "6855a7e167609f4db1779c70",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Desi chinese",
            "name": "Cheese chilli gravy",
            "price": 14.5,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.180Z",
            "updatedAt": "2025-06-20T18:26:41.180Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 14.5
          }
        ],
        "summary": {
          "subtotal": 220.25000000000003,
          "discount": 0,
          "coupon": 0,
          "additionalCharges": 0,
          "tax": 26.430000000000003,
          "total": 246.68000000000004
        },
        "customer": { "name": "hfgj" },
        "counterStaff": {
          "staff_id": "6828c99764906addfe30ba39",
          "name": "CEO Parul",
          "pos_login_pin": "1234",
          "role_name": "Admin",
          "isLoggedIn": true
        },
        "kds_at": [1.751303395865e12],
        "paymentInfo": {
          "orderTotal": 246.68,
          "tip": 0,
          "grandTotal": 246.68,
          "totalPaid": 246.68,
          "remaining": 0,
          "return": 0,
          "reference": "",
          "payments": [
            {
              "typeId": "6828ca3364906addfe30ba63",
              "typeName": "Card",
              "amount": 246.68
            }
          ]
        }
      },
      {
        "id": "order_1751306940255_513",
        "orderType": {
          "_id": "6828ca1364906addfe30ba50",
          "name": "Pick Up",
          "category": "pickup",
          "status": "active",
          "brand_id": "6828c5fd56c533c8f2ec74ad",
          "outlet_id": "6828c83956c533c8f2ec74bb",
          "createdAt": "2025-05-17T17:40:35.208Z",
          "updatedAt": "2025-06-06T08:40:43.157Z",
          "__v": 0,
          "isActive": true
        },
        "status": "settle",
        "dayInfo": {
          "id": "day_1751298725555_956",
          "openingCash": "123",
          "openTime": 1.751298725554e12,
          "comment": "szdffds",
          "openBy": "6828c99764906addfe30ba39"
        },
        "items": [
          {
            "_id": "6855a7e167609f4db1779d92",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "promotions",
            "name": "Lunch sandwich combo",
            "price": 9.99,
            "food_type": "other",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.373Z",
            "updatedAt": "2025-06-20T18:26:41.373Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 9.99
          }
        ],
        "summary": {
          "subtotal": 9.99,
          "discount": 0,
          "coupon": 0,
          "additionalCharges": 0,
          "tax": 1.1988,
          "total": 11.1888
        },
        "customer": { "name": "asd" },
        "counterStaff": {
          "staff_id": "6828c99764906addfe30ba39",
          "name": "CEO Parul",
          "pos_login_pin": "1234",
          "role_name": "Admin",
          "isLoggedIn": true
        },
        "kds_at": [1.751307415527e12],
        "paymentInfo": {
          "orderTotal": 11.19,
          "tip": 0,
          "grandTotal": 11.19,
          "totalPaid": 11.19,
          "remaining": 0,
          "return": 0,
          "reference": "",
          "payments": [
            {
              "typeId": "6828ca3364906addfe30ba63",
              "typeName": "Card",
              "amount": 11.19
            }
          ]
        }
      },
      {
        "id": "order_1751312034750_928",
        "orderType": {
          "_id": "6828ca1364906addfe30ba50",
          "name": "Pick Up",
          "category": "pickup",
          "status": "active",
          "brand_id": "6828c5fd56c533c8f2ec74ad",
          "outlet_id": "6828c83956c533c8f2ec74bb",
          "createdAt": "2025-05-17T17:40:35.208Z",
          "updatedAt": "2025-06-06T08:40:43.157Z",
          "__v": 0,
          "isActive": true
        },
        "status": "settle",
        "dayInfo": {
          "id": "day_1751298725555_956",
          "openingCash": "123",
          "openTime": 1.751298725554e12,
          "comment": "szdffds",
          "openBy": "6828c99764906addfe30ba39"
        },
        "items": [
          {
            "_id": "6855a7e167609f4db1779ba9",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetizers",
            "name": "Fries - medium",
            "price": 5.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.046Z",
            "updatedAt": "2025-06-20T18:26:41.046Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 5.99
          }
        ],
        "summary": {
          "subtotal": 5.99,
          "discount": 0,
          "coupon": 0,
          "additionalCharges": 0,
          "tax": 0.7188,
          "total": 6.7088
        },
        "customer": { "name": "hu" },
        "counterStaff": {
          "staff_id": "6828c99764906addfe30ba39",
          "name": "CEO Parul",
          "pos_login_pin": "1234",
          "role_name": "Admin",
          "isLoggedIn": true
        },
        "kds_at": [1.751312040675e12],
        "paymentInfo": {
          "orderTotal": 6.71,
          "tip": 0,
          "grandTotal": 6.71,
          "totalPaid": 6.71,
          "remaining": 0,
          "return": 0,
          "reference": "",
          "payments": [
            {
              "typeId": "6828ca3f64906addfe30ba6d",
              "typeName": "Cash",
              "amount": 6.71
            }
          ]
        }
      },
      {
        "id": "order_1751312052315_498",
        "orderType": {
          "_id": "6828ca1364906addfe30ba50",
          "name": "Pick Up",
          "category": "pickup",
          "status": "active",
          "brand_id": "6828c5fd56c533c8f2ec74ad",
          "outlet_id": "6828c83956c533c8f2ec74bb",
          "createdAt": "2025-05-17T17:40:35.208Z",
          "updatedAt": "2025-06-06T08:40:43.157Z",
          "__v": 0,
          "isActive": true
        },
        "status": "settle",
        "dayInfo": {
          "id": "day_1751298725555_956",
          "openingCash": "123",
          "openTime": 1.751298725554e12,
          "comment": "szdffds",
          "openBy": "6828c99764906addfe30ba39"
        },
        "items": [
          {
            "_id": "6855a7e167609f4db1779ba9",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetizers",
            "name": "Fries - medium",
            "price": 5.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.046Z",
            "updatedAt": "2025-06-20T18:26:41.046Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 5.99
          }
        ],
        "summary": {
          "subtotal": 5.99,
          "discount": 0,
          "coupon": 0,
          "additionalCharges": 0,
          "tax": 0.7188,
          "total": 6.7088
        },
        "customer": { "name": "fjhg" },
        "counterStaff": {
          "staff_id": "6828c99764906addfe30ba39",
          "name": "CEO Parul",
          "pos_login_pin": "1234",
          "role_name": "Admin",
          "isLoggedIn": true
        },
        "kds_at": [1.751312096434e12],
        "paymentInfo": {
          "orderTotal": 6.71,
          "tip": 0,
          "grandTotal": 6.71,
          "totalPaid": 6.71,
          "remaining": 0,
          "return": 0,
          "reference": "",
          "payments": [
            {
              "typeId": "6828ca3f64906addfe30ba6d",
              "typeName": "Cash",
              "amount": 6.71
            }
          ]
        }
      },
      {
        "id": "order_1751312116559_398",
        "orderType": {
          "_id": "6828ca1364906addfe30ba50",
          "name": "Pick Up",
          "category": "pickup",
          "status": "active",
          "brand_id": "6828c5fd56c533c8f2ec74ad",
          "outlet_id": "6828c83956c533c8f2ec74bb",
          "createdAt": "2025-05-17T17:40:35.208Z",
          "updatedAt": "2025-06-06T08:40:43.157Z",
          "__v": 0,
          "isActive": true
        },
        "status": "settle",
        "dayInfo": {
          "id": "day_1751298725555_956",
          "openingCash": "123",
          "openTime": 1.751298725554e12,
          "comment": "szdffds",
          "openBy": "6828c99764906addfe30ba39"
        },
        "items": [
          {
            "_id": "6855a7e167609f4db1779ba9",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetizers",
            "name": "Fries - medium",
            "price": 5.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.046Z",
            "updatedAt": "2025-06-20T18:26:41.046Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 5.99
          }
        ],
        "summary": {
          "subtotal": 5.99,
          "discount": 0,
          "coupon": 0,
          "additionalCharges": 0,
          "tax": 0.7188,
          "total": 6.7088
        },
        "customer": { "name": "gh" },
        "counterStaff": {
          "staff_id": "6828c99764906addfe30ba39",
          "name": "CEO Parul",
          "pos_login_pin": "1234",
          "role_name": "Admin",
          "isLoggedIn": true
        },
        "kds_at": [1.751312121399e12],
        "paymentInfo": {
          "orderTotal": 6.71,
          "tip": 0,
          "grandTotal": 6.71,
          "totalPaid": 6.71,
          "remaining": 0,
          "return": 0,
          "reference": "",
          "payments": [
            {
              "typeId": "6828ca3364906addfe30ba63",
              "typeName": "Card",
              "amount": 6.71
            }
          ]
        }
      },
      {
        "id": "order_1751312132088_146",
        "orderType": {
          "_id": "6828ca1364906addfe30ba50",
          "name": "Pick Up",
          "category": "pickup",
          "status": "active",
          "brand_id": "6828c5fd56c533c8f2ec74ad",
          "outlet_id": "6828c83956c533c8f2ec74bb",
          "createdAt": "2025-05-17T17:40:35.208Z",
          "updatedAt": "2025-06-06T08:40:43.157Z",
          "__v": 0,
          "isActive": true
        },
        "status": "settle",
        "dayInfo": {
          "id": "day_1751298725555_956",
          "openingCash": "123",
          "openTime": 1.751298725554e12,
          "comment": "szdffds",
          "openBy": "6828c99764906addfe30ba39"
        },
        "items": [
          {
            "_id": "6855a7e167609f4db1779ba9",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetizers",
            "name": "Fries - medium",
            "price": 5.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.046Z",
            "updatedAt": "2025-06-20T18:26:41.046Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 5.99
          }
        ],
        "summary": {
          "subtotal": 5.99,
          "discount": 0,
          "coupon": 0,
          "additionalCharges": 0,
          "tax": 0.7188,
          "total": 6.7088
        },
        "customer": { "name": "ghjmg" },
        "counterStaff": {
          "staff_id": "6828c99764906addfe30ba39",
          "name": "CEO Parul",
          "pos_login_pin": "1234",
          "role_name": "Admin",
          "isLoggedIn": true
        },
        "kds_at": [1.751312137658e12],
        "paymentInfo": {
          "orderTotal": 6.71,
          "tip": 0,
          "grandTotal": 6.71,
          "totalPaid": 6.71,
          "remaining": 0,
          "return": 0,
          "reference": "",
          "payments": [
            {
              "typeId": "6828ca3f64906addfe30ba6d",
              "typeName": "Cash",
              "amount": 6.71
            }
          ]
        }
      }
    ],
    "drawerRecords": [
      {
        "openTime": 1.751312170816e12,
        "openBy": {
          "staff_id": "6828c99764906addfe30ba39",
          "name": "CEO Parul",
          "pos_login_pin": "1234",
          "role_name": "Admin",
          "isLoggedIn": true
        }
      }
    ],
    "__v": 0
  },
  {
    "_id": { "$oid": "686eabc353405eb33e195839" },
    "brand_id": { "$oid": "6828c5fd56c533c8f2ec74ad" },
    "outlet_id": { "$oid": "6828c83956c533c8f2ec74bb" },
    "createdAt": { "$date": "2025-07-09T17:49:55.383Z" },
    "posInfo": {
      "timezone": {
        "label": "(UTC-05:00) Eastern Time (Canada)",
        "value": "America/Toronto"
      },
      "_id": "6828c83956c533c8f2ec74bb",
      "brand_id": "6828c5fd56c533c8f2ec74ad",
      "name": "Sector 17 Test",
      "code": "1234",
      "email": "hisar@sector17.com",
      "phone": "9310957577",
      "country_code": "+91",
      "opening_time": "01:10",
      "closing_time": "12:50",
      "website": "https://sector17.ca/",
      "street": "H. No. 659-A",
      "city": "Hisar",
      "state": "Haryana",
      "country": "Canada",
      "postal_code": "125001",
      "status": "active",
      "createdAt": "2025-05-17T17:32:41.649Z",
      "updatedAt": "2025-06-13T18:36:52.446Z",
      "__v": 0
    },
    "outletInfo": {
      "id": "day_1752074766507_526",
      "openTime": 1.752074766504e12,
      "openingCash": "23121",
      "closingCash": 456546,
      "comment": "sxdgfds",
      "openByStaff": {
        "staff_id": "6828c99764906addfe30ba39",
        "name": "CEO Parul",
        "pos_login_pin": "1234",
        "role_name": "Admin",
        "isLoggedIn": true
      },
      "closeTime": 1.752083390164e12,
      "closingComment": "dfhdfgh",
      "closeByStaff": {
        "staff_id": "6828c99764906addfe30ba39",
        "name": "CEO Parul",
        "pos_login_pin": "1234",
        "role_name": "Admin",
        "isLoggedIn": true
      }
    },
    "staffInfo": [
      {
        "staff_id": "6828c99764906addfe30ba39",
        "name": "CEO Parul",
        "role_name": "Admin"
      },
      {
        "staff_id": "6828c5fd56c533c8f2ec74b0",
        "name": "Karan Rao",
        "role_name": "Admin"
      },
      {
        "staff_id": "6828c9c964906addfe30ba45",
        "name": "Sahil",
        "role_name": "Manager"
      }
    ],
    "punchIns": [
      {
        "day_id": "day_1752074766507_526",
        "user_id": "6828c99764906addfe30ba39",
        "shift_id": "punch_1752074768296_233",
        "punch_in": 1.75207476e12,
        "punch_out": 1.752083390164e12,
        "breaks": []
      }
    ],
    "orders": [
      {
        "id": "order_1752082461959_217",
        "orderType": {
          "_id": "6828ca1f64906addfe30ba58",
          "name": "Dine-in",
          "category": "dine-in",
          "status": "active",
          "brand_id": "6828c5fd56c533c8f2ec74ad",
          "outlet_id": "6828c83956c533c8f2ec74bb",
          "createdAt": "2025-05-17T17:40:47.840Z",
          "updatedAt": "2025-06-05T13:49:33.299Z",
          "__v": 0,
          "isActive": true
        },
        "status": "settle",
        "dayInfo": {
          "id": "day_1752074766507_526",
          "openingCash": "23121",
          "openTime": 1.752074766504e12,
          "comment": "sxdgfds",
          "openBy": "6828c99764906addfe30ba39"
        },
        "tableInfo": [
          {
            "_id": "6828caf864906addfe30ba9b",
            "brand_id": "6828c5fd56c533c8f2ec74ad",
            "outlet_id": "6828c83956c533c8f2ec74bb",
            "floor_id": {
              "_id": "6828cabe64906addfe30ba85",
              "floor_name": "Ground Floor",
              "status": "active"
            },
            "table_name": "t0",
            "sitting": 4,
            "type": "rectangle",
            "status": "active",
            "createdAt": "2025-05-17T17:44:24.175Z",
            "updatedAt": "2025-05-17T17:44:24.175Z",
            "__v": 0,
            "tableStatus": "available"
          }
        ],
        "items": [
          {
            "_id": "6855a7e167609f4db1779bce",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetrizers",
            "name": "2pcs chicken and fries combo",
            "price": 9.99,
            "food_type": "non-veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.073Z",
            "updatedAt": "2025-06-20T18:26:41.073Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 9.99,
            "is_ready": 1.752082613924e12
          },
          {
            "_id": "6855a7e167609f4db1779bb0",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetrizers",
            "name": "Fries - large",
            "price": 7.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.050Z",
            "updatedAt": "2025-06-20T18:26:41.050Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 7.99,
            "is_ready": 1.752082615359e12
          },
          {
            "_id": "6855a7e167609f4db1779d79",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Chaat House",
            "name": "Dahi puri",
            "price": 8.99,
            "food_type": "other",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.355Z",
            "updatedAt": "2025-06-20T18:26:41.355Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 8.99,
            "is_ready": 1.752082618763e12
          },
          {
            "_id": "6855a7e167609f4db1779cb8",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Combo",
            "name": "Fries and masala soda",
            "price": 5.99,
            "food_type": "other",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.228Z",
            "updatedAt": "2025-06-20T18:26:41.228Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 5.99,
            "is_ready": 1.752082621413e12
          }
        ],
        "summary": {
          "subtotal": 32.96,
          "discount": 0,
          "coupon": 0,
          "additionalCharges": 0,
          "tax": 3.9552,
          "total": 36.9152
        },
        "counterStaff": {
          "staff_id": "6828c99764906addfe30ba39",
          "name": "CEO Parul",
          "pos_login_pin": "1234",
          "role_name": "Admin",
          "isLoggedIn": true
        },
        "customer": {
          "name": "sharan",
          "phone": "4379887649",
          "note": "no onion "
        },
        "kds_at": [1.752082560056e12],
        "paymentInfo": {
          "orderTotal": 36.92,
          "tip": 0,
          "grandTotal": 36.92,
          "totalPaid": 36.92,
          "remaining": 0,
          "return": 0,
          "reference": "",
          "payments": [
            {
              "typeId": "6828ca3364906addfe30ba63",
              "typeName": "Card",
              "amount": 36.92
            }
          ]
        },
        "counterStaffAtRefund": {
          "staff_id": "6828c99764906addfe30ba39",
          "name": "CEO Parul",
          "pos_login_pin": "1234",
          "role_name": "Admin",
          "isLoggedIn": true
        },
        "refundReason": "fyjhhgfj",
        "refund_at": 1.752083310477e12,
        "refundAmount": 8.95,
        "refundedItems": [
          {
            "_id": "6855a7e167609f4db1779bb0",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetrizers",
            "name": "Fries - large",
            "price": 7.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.050Z",
            "updatedAt": "2025-06-20T18:26:41.050Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 7.99,
            "is_ready": 1.752082615359e12,
            "refundedAt": 1.752083310477e12,
            "refundReason": "fyjhhgfj"
          }
        ]
      },
      {
        "id": "order_1752082694462_212",
        "orderType": {
          "_id": "6828ca1f64906addfe30ba58",
          "name": "Dine-in",
          "category": "dine-in",
          "status": "active",
          "brand_id": "6828c5fd56c533c8f2ec74ad",
          "outlet_id": "6828c83956c533c8f2ec74bb",
          "createdAt": "2025-05-17T17:40:47.840Z",
          "updatedAt": "2025-06-05T13:49:33.299Z",
          "__v": 0,
          "isActive": true
        },
        "status": "settle",
        "dayInfo": {
          "id": "day_1752074766507_526",
          "openingCash": "23121",
          "openTime": 1.752074766504e12,
          "comment": "sxdgfds",
          "openBy": "6828c99764906addfe30ba39"
        },
        "tableInfo": [
          {
            "_id": "6828cb3664906addfe30baa4",
            "brand_id": "6828c5fd56c533c8f2ec74ad",
            "outlet_id": "6828c83956c533c8f2ec74bb",
            "floor_id": {
              "_id": "6828cabe64906addfe30ba85",
              "floor_name": "Ground Floor",
              "status": "active"
            },
            "table_name": "t02",
            "sitting": 10,
            "type": "other",
            "status": "active",
            "createdAt": "2025-05-17T17:45:26.295Z",
            "updatedAt": "2025-05-17T17:45:26.295Z",
            "__v": 0,
            "tableStatus": "available"
          }
        ],
        "items": [
          {
            "_id": "6855a7e167609f4db1779bce",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetrizers",
            "name": "2pcs chicken and fries combo",
            "price": 9.99,
            "food_type": "non-veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.073Z",
            "updatedAt": "2025-06-20T18:26:41.073Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 9.99
          },
          {
            "_id": "6855a7e167609f4db1779bbf",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetrizers",
            "name": "Veg spring rolls large",
            "price": 11.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.061Z",
            "updatedAt": "2025-06-20T18:26:41.061Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 11.99
          },
          {
            "_id": "6855a7e167609f4db1779bc9",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetrizers",
            "name": "noodle spring roll large (6pcs)",
            "price": 11.48,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.070Z",
            "updatedAt": "2025-06-20T18:26:41.070Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 11.48
          },
          {
            "_id": "6855a7e167609f4db1779d2a",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Shakes",
            "name": "Butterscoth Falooda",
            "price": 7.99,
            "food_type": "other",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.306Z",
            "updatedAt": "2025-06-20T18:26:41.306Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 7.99
          },
          {
            "_id": "6855a7e167609f4db1779d11",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Shakes",
            "name": "Chocolate Shake",
            "price": 7.49,
            "food_type": "other",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.290Z",
            "updatedAt": "2025-06-20T18:26:41.290Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 7.49
          }
        ],
        "summary": {
          "subtotal": 48.940000000000005,
          "discount": 4.894,
          "coupon": 0,
          "additionalCharges": 0,
          "tax": 5.285520000000001,
          "total": 49.331520000000005
        },
        "counterStaff": {
          "staff_id": "6828c99764906addfe30ba39",
          "name": "CEO Parul",
          "pos_login_pin": "1234",
          "role_name": "Admin",
          "isLoggedIn": true
        },
        "customer": { "name": "svsfrts", "note": "dfghjhghj" },
        "kds_at": [1.752082830587e12],
        "discount": {
          "_id": "6853b64745632c17816138df",
          "brand_id": "6828c5fd56c533c8f2ec74ad",
          "outlet_id": "6828c83956c533c8f2ec74bb",
          "name": "special10",
          "apply_type": "discount",
          "apply_on_all_order_types": true,
          "order_type": null,
          "apply_on_all_menus": true,
          "menu": { "_id": "6828d2b864906addfe30bbae" },
          "apply_on_all_categories": true,
          "category": null,
          "apply_on_all_items": true,
          "item": null,
          "type": "percentage",
          "rate": 10,
          "start_time": "",
          "end_time": "",
          "status": "active",
          "code": "",
          "createdAt": "2025-06-19T07:03:35.832Z",
          "updatedAt": "2025-06-19T07:03:35.832Z",
          "__v": 0,
          "use_for": "item"
        },
        "extra_charge": null,
        "onHold": true,
        "paymentInfo": {
          "orderTotal": 49.33,
          "tip": 0,
          "grandTotal": 49.33,
          "totalPaid": 50,
          "remaining": 0,
          "return": 0.6700000000000017,
          "reference": "",
          "payments": [
            {
              "typeId": "6828ca3364906addfe30ba63",
              "typeName": "Card",
              "amount": 50
            }
          ]
        }
      },
      {
        "id": "order_1752082935261_656",
        "orderType": {
          "_id": "684e708845632c1781612cb7",
          "name": "Zomato",
          "category": "third-party",
          "status": "active",
          "brand_id": "6828c5fd56c533c8f2ec74ad",
          "outlet_id": "6828c83956c533c8f2ec74bb",
          "createdAt": "2025-06-15T07:04:40.399Z",
          "updatedAt": "2025-06-15T07:04:40.399Z",
          "__v": 0,
          "isActive": true
        },
        "status": "settle",
        "dayInfo": {
          "id": "day_1752074766507_526",
          "openingCash": "23121",
          "openTime": 1.752074766504e12,
          "comment": "sxdgfds",
          "openBy": "6828c99764906addfe30ba39"
        },
        "items": [
          {
            "_id": "6855a7e167609f4db1779ba9",
            "menu_id": "6828d2b864906addfe30bbae",
            "category_name": "Appetizers",
            "name": "Fries - medium",
            "price": 5.99,
            "food_type": "veg",
            "status": "active",
            "image": "https://example.com/images/paneer-momos.jpg",
            "createdAt": "2025-06-20T18:26:41.046Z",
            "updatedAt": "2025-06-20T18:26:41.046Z",
            "__v": 0,
            "quantity": 1,
            "activeAddons": [],
            "total_price": 5.99
          }
        ],
        "summary": {
          "subtotal": 5.99,
          "discount": 0,
          "coupon": 0,
          "additionalCharges": 0,
          "tax": 0.7188,
          "total": 6.7088
        },
        "counterStaff": {
          "staff_id": "6828c99764906addfe30ba39",
          "name": "CEO Parul",
          "pos_login_pin": "1234",
          "role_name": "Admin",
          "isLoggedIn": true
        },
        "customer": { "name": "iljkl" },
        "kds_at": [1.752082944997e12],
        "onHold": true,
        "paymentInfo": {
          "orderTotal": 6.71,
          "tip": 0,
          "grandTotal": 6.71,
          "totalPaid": 6.71,
          "remaining": 0,
          "return": 0,
          "reference": "",
          "payments": [
            {
              "typeId": "6828ca3f64906addfe30ba6d",
              "typeName": "Cash",
              "amount": 6.71
            }
          ]
        }
      }
    ],
    "drawerRecords": [
      {
        "openTime": 1.752082440361e12,
        "openBy": {
          "staff_id": "6828c99764906addfe30ba39",
          "name": "CEO Parul",
          "pos_login_pin": "1234",
          "role_name": "Admin",
          "isLoggedIn": true
        }
      }
    ],
    "__v": 0
  }
];

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = "#EFA280" }) => (
  <div className="metric-card">
    <div className="metric-card-content">
      <div className="metric-card-text">
        <p className="metric-card-title">{title}</p>
        <p className="metric-card-value">{value}</p>
        {subtitle && <p className="metric-card-subtitle">{subtitle}</p>}
      </div>
      <div className="metric-card-icon" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-6 w-6" style={{ color, width: '1.5rem', height: '1.5rem' }} />
      </div>
    </div>
    {trend && (
      <div className="metric-card-trend">
        {trend === 'up' ? (
          <ArrowUpRight style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} className="trend-up" />
        ) : trend === 'down' ? (
          <ArrowDownRight style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} className="trend-down" />
        ) : (
          <Minus style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} className="trend-neutral" />
        )}
        <span className={`trend-text ${
          trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-neutral'
        }`}>
          {trendValue}%
        </span>
        <span className="trend-label">vs last period</span>
      </div>
    )}
  </div>
);

const ChartContainer = ({ title, children, actions }) => (
  <div className="chart-container">
    <div className="chart-header">
      <h3 className="chart-title">{title}</h3>
      {actions && <div className="chart-actions">{actions}</div>}
    </div>
    {children}
  </div>
);

const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    settle: { className: 'status-completed', label: 'Completed' },
    refund: { className: 'status-refunded', label: 'Refunded' },
    pending: { className: 'status-pending', label: 'Pending' },
    cancelled: { className: 'status-cancelled', label: 'Cancelled' }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
};

// Chart Components
const RevenueChart = ({ dailyRevenue }) => {
  const dates = Object.keys(dailyRevenue).sort();
  const revenues = dates.map(date => dailyRevenue[date]);

  const data = {
    labels: dates.map(date => new Date(date).toLocaleDateString()),
    datasets: [
      {
        label: 'Daily Revenue',
        data: revenues,
        borderColor: '#DF6229',
        backgroundColor: 'rgba(223, 98, 41, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(0);
          }
        }
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Line data={data} options={options} />
    </div>
  );
};

const HourlyRevenueChart = ({ hourlyRevenue }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const data = {
    labels: hours.map(hour => `${hour}:00`),
    datasets: [
      {
        label: 'Hourly Revenue',
        data: hourlyRevenue,
        backgroundColor: 'rgba(239, 162, 128, 0.8)',
        borderColor: '#EFA280',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(0);
          }
        }
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

const PaymentMethodsChart = ({ paymentMethods }) => {
  const methods = Object.keys(paymentMethods);
  const amounts = Object.values(paymentMethods);

  const data = {
    labels: methods,
    datasets: [
      {
        data: amounts,
        backgroundColor: [
          '#DF6229',
          '#EFA280',
          '#F4A261',
          '#E76F51',
          '#2A9D8F',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = amounts.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: $${context.raw.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

const OrderStatusChart = ({ orderStatuses }) => {
  const statuses = Object.keys(orderStatuses);
  const counts = Object.values(orderStatuses);

  const data = {
    labels: statuses.map(status => {
      const statusLabels = {
        settle: 'Completed',
        refund: 'Refunded',
        pending: 'Pending',
        cancelled: 'Cancelled'
      };
      return statusLabels[status] || status;
    }),
    datasets: [
      {
        data: counts,
        backgroundColor: [
          '#10B981', // Green for completed
          '#EF4444', // Red for refunded
          '#F59E0B', // Yellow for pending
          '#6B7280', // Gray for cancelled
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = counts.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${context.raw} orders (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Pie data={data} options={options} />
    </div>
  );
};

const TopCategoriesChart = ({ topCategories }) => {
  const categories = topCategories.slice(0, 6);
  const data = {
    labels: categories.map(cat => cat.name),
    datasets: [
      {
        label: 'Revenue',
        data: categories.map(cat => cat.revenue),
        backgroundColor: 'rgba(223, 98, 41, 0.8)',
        borderColor: '#DF6229',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(0);
          }
        }
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

const OutletPerformanceChart = ({ outletPerformance }) => {
  const outlets = outletPerformance.slice(0, 5);
  const data = {
    labels: outlets.map(([name]) => name),
    datasets: [
      {
        label: 'Revenue',
        data: outlets.map(([, performance]) => performance.revenue),
        backgroundColor: 'rgba(239, 162, 128, 0.8)',
        borderColor: '#EFA280',
        borderWidth: 1,
      },
      {
        label: 'Orders',
        data: outlets.map(([, performance]) => performance.orders * 10), // Scale for visibility
        backgroundColor: 'rgba(223, 98, 41, 0.8)',
        borderColor: '#DF6229',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.datasetIndex === 1) {
              return `Orders: ${(context.raw / 10).toFixed(0)}`;
            }
            return `Revenue: $${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

function Dashboard() {
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedOutlet, setSelectedOutlet] = useState('all');
  
  // Extract brands and outlets from data
  const { brands, outlets } = useMemo(() => {
    const brandMap = new Map();
    const outletMap = new Map();
    
    sampleData.forEach(dayReport => {
      if (dayReport.posInfo) {
        const brandId = dayReport.brand_id?.$oid;
        const outletId = dayReport.outlet_id?.$oid;
        
        if (brandId && !brandMap.has(brandId)) {
          brandMap.set(brandId, {
            id: brandId,
            name: dayReport.posInfo.name || 'Unknown Brand'
          });
        }
        
        if (outletId && !outletMap.has(outletId)) {
          outletMap.set(outletId, {
            id: outletId,
            brandId: brandId,
            name: dayReport.posInfo.name,
            city: dayReport.posInfo.city,
            state: dayReport.posInfo.state
          });
        }
      }
    });
    
    return {
      brands: Array.from(brandMap.values()),
      outlets: Array.from(outletMap.values())
    };
  }, []);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return sampleData.filter(dayReport => {
      const brandId = dayReport.brand_id?.$oid;
      const outletId = dayReport.outlet_id?.$oid;
      
      if (selectedBrand !== 'all' && brandId !== selectedBrand) return false;
      if (selectedOutlet !== 'all' && outletId !== selectedOutlet) return false;
      
      // Add date filtering logic here if needed
      return true;
    });
  }, [selectedBrand, selectedOutlet, dateFilter]);

  // Calculate comprehensive dashboard metrics
  const dashboardMetrics = useMemo(() => {
    let totalOrders = 0;
    let totalRevenue = 0;
    let totalTax = 0;
    let totalTips = 0;
    let totalDiscounts = 0;
    let totalRefunds = 0;
    let uniqueCustomers = new Set();
    let paymentMethods = {};
    let orderStatuses = {};
    let topItems = {};
    let topCategories = {};
    let orderTypes = {};
    let hourlyRevenue = Array(24).fill(0);
    let dailyRevenue = {};
    let customerGrowth = {};
    let staffPerformance = {};
    let outletPerformance = {};
    
    filteredData.forEach(dayReport => {
      const outletName = dayReport.posInfo?.name || 'Unknown Outlet';
      
      // Initialize outlet performance
      if (!outletPerformance[outletName]) {
        outletPerformance[outletName] = {
          orders: 0,
          revenue: 0,
          customers: new Set()
        };
      }
      
      if (!dayReport.orders) return;
      
      dayReport.orders.forEach(order => {
        totalOrders++;
        outletPerformance[outletName].orders++;
        
        // Revenue calculation
        const revenue = order.paymentInfo?.orderTotal || 0;
        totalRevenue += revenue;
        outletPerformance[outletName].revenue += revenue;
        
        // Tax calculation
        const tax = order.summary?.tax || 0;
        totalTax += tax;
        
        // Tips calculation
        const tip = order.paymentInfo?.tip || 0;
        totalTips += tip;
        
        // Discounts calculation
        const discount = order.summary?.discount || 0;
        totalDiscounts += discount;
        
        // Track refunds
        if (order.status === 'refund') {
          totalRefunds += order.refundAmount || 0;
        }
        
        // Customer tracking
        if (order.customer?.name) {
          const customerName = order.customer.name.toLowerCase();
          uniqueCustomers.add(customerName);
          outletPerformance[outletName].customers.add(customerName);
          
          // Customer growth by date
          const orderDate = new Date(order.kds_at?.[0] || Date.now()).toDateString();
          if (!customerGrowth[orderDate]) {
            customerGrowth[orderDate] = new Set();
          }
          customerGrowth[orderDate].add(customerName);
        }
        
        // Payment methods
        if (order.paymentInfo?.payments) {
          order.paymentInfo.payments.forEach(payment => {
            paymentMethods[payment.typeName] = (paymentMethods[payment.typeName] || 0) + payment.amount;
          });
        }
        
        // Order statuses
        orderStatuses[order.status] = (orderStatuses[order.status] || 0) + 1;
        
        // Order types
        if (order.orderType?.name) {
          orderTypes[order.orderType.name] = (orderTypes[order.orderType.name] || 0) + 1;
        }
        
        // Staff performance
        if (order.counterStaff?.name) {
          const staffName = order.counterStaff.name;
          if (!staffPerformance[staffName]) {
            staffPerformance[staffName] = { orders: 0, revenue: 0 };
          }
          staffPerformance[staffName].orders++;
          staffPerformance[staffName].revenue += revenue;
        }
        
        // Top items and categories
        if (order.items) {
          order.items.forEach(item => {
            const itemKey = item.name;
            const categoryKey = item.category_name;
            
            if (!topItems[itemKey]) {
              topItems[itemKey] = { name: itemKey, quantity: 0, revenue: 0 };
            }
            topItems[itemKey].quantity += item.quantity || 1;
            topItems[itemKey].revenue += item.total_price || 0;
            
            if (!topCategories[categoryKey]) {
              topCategories[categoryKey] = { name: categoryKey, quantity: 0, revenue: 0 };
            }
            topCategories[categoryKey].quantity += item.quantity || 1;
            topCategories[categoryKey].revenue += item.total_price || 0;
          });
        }
        
        // Daily revenue
        const orderDate = new Date(order.kds_at?.[0] || Date.now()).toDateString();
        dailyRevenue[orderDate] = (dailyRevenue[orderDate] || 0) + revenue;
        
        // Hourly revenue (simplified - using current hour for demo)
        const hour = new Date(order.kds_at?.[0] || Date.now()).getHours();
        hourlyRevenue[hour] += revenue;
      });
    });
    
    // Convert outlet performance customers to count
    Object.keys(outletPerformance).forEach(outlet => {
      outletPerformance[outlet].customers = outletPerformance[outlet].customers.size;
    });
    
    return {
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      totalTax: totalTax.toFixed(2),
      totalTips: totalTips.toFixed(2),
      totalDiscounts: totalDiscounts.toFixed(2),
      totalRefunds: totalRefunds.toFixed(2),
      uniqueCustomers: uniqueCustomers.size,
      paymentMethods,
      orderStatuses,
      topItems: Object.values(topItems).sort((a, b) => b.revenue - a.revenue).slice(0, 10),
      topCategories: Object.values(topCategories).sort((a, b) => b.revenue - a.revenue).slice(0, 8),
      orderTypes,
      hourlyRevenue,
      dailyRevenue,
      customerGrowth: Object.keys(customerGrowth).length,
      staffPerformance: Object.entries(staffPerformance).sort(([,a], [,b]) => b.revenue - a.revenue).slice(0, 5),
      outletPerformance: Object.entries(outletPerformance).sort(([,a], [,b]) => b.revenue - a.revenue),
      averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00',
      netRevenue: (totalRevenue - totalRefunds - totalDiscounts).toFixed(2)
    };
  }, [filteredData]);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-flex">
            <div className="header-left">
              <Coffee style={{ width: '2rem', height: '2rem', marginRight: '0.75rem', color: '#DF6229' }} />
              <h1 className="header-title">POS Admin Dashboard</h1>
            </div>
            <div className="header-right">
              <select 
                value={selectedBrand} 
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedOutlet('all'); // Reset outlet when brand changes
                }}
                className="select"
              >
                <option value="all">All Brands</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              
              <select 
                value={selectedOutlet} 
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className="select"
                disabled={selectedBrand === 'all'}
              >
                <option value="all">All Outlets</option>
                {outlets
                  .filter(outlet => selectedBrand === 'all' || outlet.brandId === selectedBrand)
                  .map(outlet => (
                    <option key={outlet.id} value={outlet.id}>
                      {outlet.name} - {outlet.city}
                    </option>
                  ))}
              </select>
              
              <select 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                className="select"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              
              <button className="button-primary">
                <Download style={{ width: '1rem', height: '1rem' }} />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Key Metrics */}
        <div className="grid-4">
          <MetricCard
            title="Total Orders"
            value={dashboardMetrics.totalOrders.toLocaleString()}
            subtitle="All orders processed"
            icon={ShoppingCart}
            trend="up"
            trendValue="12.5"
            color="#DF6229"
          />
          <MetricCard
            title="Total Revenue"
            value={`$${parseFloat(dashboardMetrics.totalRevenue).toLocaleString()}`}
            subtitle="Gross revenue"
            icon={DollarSign}
            trend="up"
            trendValue="8.3"
            color="#EFA280"
          />
          <MetricCard
            title="Unique Customers"
            value={dashboardMetrics.uniqueCustomers.toLocaleString()}
            subtitle="Total customers served"
            icon={Users}
            trend="up"
            trendValue="5.1"
            color="#DF6229"
          />
          <MetricCard
            title="Avg Order Value"
            value={`$${dashboardMetrics.averageOrderValue}`}
            subtitle="Per order average"
            icon={TrendingUp}
            trend="down"
            trendValue="2.1"
            color="#EFA280"
          />
        </div>

        {/* Financial Metrics */}
        <div className="grid-4">
          <MetricCard
            title="Total Tax"
            value={`$${parseFloat(dashboardMetrics.totalTax).toLocaleString()}`}
            subtitle="Tax collected"
            icon={Percent}
            color="#DF6229"
          />
          <MetricCard
            title="Total Tips"
            value={`$${parseFloat(dashboardMetrics.totalTips).toLocaleString()}`}
            subtitle="Tips received"
            icon={DollarSign}
            color="#EFA280"
          />
          <MetricCard
            title="Total Discounts"
            value={`$${parseFloat(dashboardMetrics.totalDiscounts).toLocaleString()}`}
            subtitle="Discounts given"
            icon={Percent}
            color="#DF6229"
          />
          <MetricCard
            title="Total Refunds"
            value={`$${parseFloat(dashboardMetrics.totalRefunds).toLocaleString()}`}
            subtitle="Refunded amount"
            icon={RefreshCw}
            color="#EFA280"
          />
        </div>

        {/* Operational Metrics */}
        <div className="grid-3">
          <MetricCard
            title="Net Revenue"
            value={`$${parseFloat(dashboardMetrics.netRevenue).toLocaleString()}`}
            subtitle="After refunds & discounts"
            icon={Receipt}
            trend="up"
            trendValue="6.2"
            color="#DF6229"
          />
          <MetricCard
            title="Active Outlets"
            value={dashboardMetrics.outletPerformance.length}
            subtitle="Operating locations"
            icon={Store}
            color="#EFA280"
          />
          <MetricCard
            title="Customer Growth"
            value={dashboardMetrics.customerGrowth}
            subtitle="Days with new customers"
            icon={Users}
            trend="up"
            trendValue="15.3"
            color="#DF6229"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid-1">
          <ChartContainer title="Revenue Trend Over Time">
            <RevenueChart dailyRevenue={dashboardMetrics.dailyRevenue} />
          </ChartContainer>
        </div>

        {/* Charts Row 2 */}
        <div className="grid-2">
          <ChartContainer title="Hourly Revenue Distribution">
            <HourlyRevenueChart hourlyRevenue={dashboardMetrics.hourlyRevenue} />
          </ChartContainer>
          <ChartContainer title="Payment Methods Breakdown">
            <PaymentMethodsChart paymentMethods={dashboardMetrics.paymentMethods} />
          </ChartContainer>
        </div>

        {/* Charts Row 3 */}
        <div className="grid-2">
          <ChartContainer title="Order Status Distribution">
            <OrderStatusChart orderStatuses={dashboardMetrics.orderStatuses} />
          </ChartContainer>
          <ChartContainer title="Top Categories Performance">
            <TopCategoriesChart topCategories={dashboardMetrics.topCategories} />
          </ChartContainer>
        </div>

        {/* Charts Row 4 */}
        {selectedBrand === 'all' && (
          <div className="grid-1">
            <ChartContainer title="Outlet Performance Comparison">
              <OutletPerformanceChart outletPerformance={dashboardMetrics.outletPerformance} />
            </ChartContainer>
          </div>
        )}

        {/* Original Data Cards Row 1 */}
        <div className="grid-2">
          {/* Payment Methods */}
          <ChartContainer title="Payment Methods Distribution">
            <div className="space-y-4">
              {Object.entries(dashboardMetrics.paymentMethods).map(([method, amount]) => {
                const percentage = ((amount / parseFloat(dashboardMetrics.totalRevenue)) * 100).toFixed(1);
                return (
                  <div key={method} className="list-item">
                    <div className="list-item-left">
                      <CreditCard style={{ width: '1rem', height: '1rem' }} className="list-item-icon" />
                      <span className="list-item-text">{method}</span>
                    </div>
                    <div className="list-item-right">
                      <span className="list-item-value">${amount.toFixed(2)}</span>
                      <span className="list-item-percentage">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartContainer>

          {/* Order Status */}
          <ChartContainer title="Order Status Overview">
            <div className="space-y-4">
              {Object.entries(dashboardMetrics.orderStatuses).map(([status, count]) => {
                const percentage = ((count / dashboardMetrics.totalOrders) * 100).toFixed(1);
                return (
                  <div key={status} className="list-item">
                    <OrderStatusBadge status={status} />
                    <div className="list-item-right">
                      <span className="list-item-value">{count} orders</span>
                      <span className="list-item-percentage">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartContainer>
        </div>

        {/* Original Data Cards Row 2 */}
        <div className="grid-2">
          {/* Order Types */}
          <ChartContainer title="Order Types Performance">
            <div className="space-y-4">
              {Object.entries(dashboardMetrics.orderTypes).map(([type, count]) => {
                const percentage = ((count / dashboardMetrics.totalOrders) * 100).toFixed(1);
                return (
                  <div key={type} className="list-item">
                    <div className="list-item-left">
                      <ChefHat style={{ width: '1rem', height: '1rem' }} className="list-item-icon" />
                      <span className="list-item-text">{type}</span>
                    </div>
                    <div className="list-item-right">
                      <span className="list-item-value">{count} orders</span>
                      <span className="list-item-percentage">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartContainer>

          {/* Top Categories */}
          <ChartContainer title="Popular Categories">
            <div className="space-y-4">
              {dashboardMetrics.topCategories.slice(0, 6).map((category, index) => (
                <div key={category.name} className="ranking-item">
                  <div className="ranking-left">
                    <div className="ranking-number" style={{ backgroundColor: '#DF6229' }}>
                      {index + 1}
                    </div>
                    <div className="ranking-details">
                      <span className="ranking-name">{category.name}</span>
                      <span className="ranking-subtitle">{category.quantity} items sold</span>
                    </div>
                  </div>
                  <span className="ranking-value">${category.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </ChartContainer>
        </div>

        {/* Original Data Cards Row 3 */}
        <div className="grid-2">
          {/* Top Items */}
          <ChartContainer title="Best Selling Items">
            <div className="space-y-4">
              {dashboardMetrics.topItems.slice(0, 8).map((item, index) => (
                <div key={item.name} className="ranking-item">
                  <div className="ranking-left">
                    <div className="ranking-number" style={{ backgroundColor: '#EFA280' }}>
                      {index + 1}
                    </div>
                    <div className="ranking-details">
                      <span className="ranking-name">{item.name}</span>
                      <span className="ranking-subtitle">{item.quantity} sold</span>
                    </div>
                  </div>
                  <span className="ranking-value">${item.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </ChartContainer>

          {/* Staff Performance */}
          <ChartContainer title="Top Performing Staff">
            <div className="space-y-4">
              {dashboardMetrics.staffPerformance.map(([staffName, performance], index) => (
                <div key={staffName} className="ranking-item">
                  <div className="ranking-left">
                    <div className="ranking-number" style={{ backgroundColor: '#DF6229' }}>
                      {index + 1}
                    </div>
                    <div className="ranking-details">
                      <span className="ranking-name">{staffName}</span>
                      <span className="ranking-subtitle">{performance.orders} orders</span>
                    </div>
                  </div>
                  <span className="ranking-value">${performance.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </ChartContainer>
        </div>

        {/* Outlet Performance */}
        {selectedBrand === 'all' && (
          <div className="mb-8">
            <ChartContainer title="Outlet Performance Overview">
              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Outlet</th>
                      <th className="table-header-cell">Orders</th>
                      <th className="table-header-cell">Revenue</th>
                      <th className="table-header-cell">Customers</th>
                      <th className="table-header-cell">Avg Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardMetrics.outletPerformance.map(([outletName, performance]) => (
                      <tr key={outletName} className="table-row">
                        <td className="table-cell table-cell-primary">{outletName}</td>
                        <td className="table-cell table-cell-secondary">{performance.orders}</td>
                        <td className="table-cell table-cell-primary">${performance.revenue.toFixed(2)}</td>
                        <td className="table-cell table-cell-secondary">{performance.customers}</td>
                        <td className="table-cell table-cell-secondary">
                          ${performance.orders > 0 ? (performance.revenue / performance.orders).toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartContainer>
          </div>
        )}

        {/* Recent Orders */}
        <ChartContainer 
          title="Recent Orders" 
          actions={[
            <button key="filter" className="button-icon">
              <Filter style={{ width: '1rem', height: '1rem' }} />
            </button>
          ]}
        >
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Order ID</th>
                  <th className="table-header-cell">Customer</th>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Amount</th>
                  <th className="table-header-cell">Payment</th>
                  <th className="table-header-cell">Staff</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 3).map(dayReport => 
                  dayReport.orders?.slice(0, 10).map(order => (
                    <tr key={order.id} className="table-row">
                      <td className="table-cell table-cell-primary">
                        #{order.id.slice(-6)}
                      </td>
                      <td className="table-cell table-cell-secondary">
                        {order.customer?.name || 'N/A'}
                      </td>
                      <td className="table-cell table-cell-secondary">
                        {order.orderType?.name || 'N/A'}
                      </td>
                      <td className="table-cell">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="table-cell table-cell-primary">
                        ${order.paymentInfo?.orderTotal?.toFixed(2) || '0.00'}
                      </td>
                      <td className="table-cell table-cell-secondary">
                        {order.paymentInfo?.payments?.[0]?.typeName || 'N/A'}
                      </td>
                      <td className="table-cell table-cell-secondary">
                        {order.counterStaff?.name || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}

export default Dashboard;