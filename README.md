my-admin-panel/
├── public/
│   └── index.html
├── src/
│   ├── assets/                      # For static assets like images, icons, fonts
│   │   ├── icons/
│   │   ├── images/
│   │   └── fonts/
│   ├── components/                  # Reusable UI components
│   │   ├── Button/
│   │   │   ├── Button.js
│   │   │   ├── Button.test.js
│   │   │   └── Button.module.css
│   │   ├── Input/
│   │   │   ├── Input.js
│   │   │   ├── Input.test.js
│   │   │   └── Input.module.css
│   │   └── Sidebar/
│   │       ├── Sidebar.js
│   │       ├── Sidebar.test.js
│   │       └── Sidebar.module.css
│   ├── constants/                   # Define app-wide constants
│   │   ├── apiRoutes.js
│   │   └── roles.js
│   ├── context/                     # For context API state management
│   │   ├── AuthContext.js
│   │   ├── ThemeContext.js
│   │   └── SettingsContext.js
│   ├── hooks/                       # Custom hooks
│   │   ├── useAuth.js
│   │   └── useFetch.js
│   ├── layouts/                     # Page layout wrappers
│   │   ├── AdminLayout.js
│   │   └── AuthLayout.js
│   ├── pages/                       # Main application pages
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.js
│   │   │   └── Dashboard.module.css
│   │   ├── Users/
│   │   │   ├── UserList.js
│   │   │   ├── UserDetail.js
│   │   │   └── Users.module.css
│   │   ├── Products/
│   │   │   ├── ProductList.js
│   │   │   ├── ProductDetail.js
│   │   │   └── Products.module.css
│   │   ├── Orders/
│   │   │   ├── OrderList.js
│   │   │   └── OrderDetail.js
│   │   ├── Settings/
│   │   │   ├── GeneralSettings.js
│   │   │   └── AccountSettings.js
│   │   └── Auth/
│   │       ├── Login.js
│   │       ├── Register.js
│   │       └── Auth.module.css
│   ├── services/                    # API calls and service utilities
│   │   ├── api.js
│   │   ├── userService.js
│   │   └── productService.js
│   ├── styles/                      # Global styles and theme variables
│   │   ├── theme.js
│   │   ├── global.css
│   │   └── mixins.css
│   ├── utils/                       # Utility functions
│   │   ├── formatDate.js
│   │   └── validateInput.js
│   ├── App.js                       # Root component
│   ├── App.css                      # Root stylesheet
│   ├── index.js                     # Entry point for React
│   ├── reportWebVitals.js
│   └── setupTests.js                # Setup for tests
├── .env                             # Environment variables
├── .gitignore
├── package.json
└── README.md
