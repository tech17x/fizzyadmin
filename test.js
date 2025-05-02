const data = [
  {
    "name": "franchise_welcome_notification",
    "parameter_format": "POSITIONAL",
    "components": [
      {
        "type": "HEADER",
        "format": "TEXT",
        "text": "Hello {{1}},",
        "example": {
          "header_text": ["Franchise Name"]
        }
      },
      {
        "type": "BODY",
        "text": "Your request has been received.\n\nThis Message is to let you know that we received your request and we will get back to you as soon as possible with more information.\n\nBest Regards,\n\nSector 17"
      },
      {
        "type": "FOOTER",
        "text": "Sector 17, 12 Bram Ct #18, Brampton, ON L6W 3V1, Canada"
      },
      {
        "type": "BUTTONS",
        "buttons": [
          {
            "type": "URL",
            "text": "Franchise Brochure",
            "url": "https://aio.sector17.ca/franchise-brochure"
          },
          {
            "type": "URL",
            "text": "View Our Menu",
            "url": "https://aio.sector17.ca/menu"
          }
        ]
      }
    ],
    "language": "en",
    "status": "APPROVED",
    "category": "UTILITY",
    "id": "1957930788005367"
  },
  {
    "name": "franchise_lead_notification",
    "parameter_format": "POSITIONAL",
    "components": [
      {
        "type": "HEADER",
        "format": "TEXT",
        "text": "Maalik Mujhe Bhi Dekhlo"
      },
      {
        "type": "BODY",
        "text": "Hello {{14}}\n\nNew lead is assigned to you.\n\n*Lead Name:* {{1}}\n*Lead Email:* {{2}}\n*Lead Phone Number:* {{3}}\n*Lead City:* {{4}}\n*Your Message:* {{5}}\n*Annual net worth:* {{6}}\n*Liquid capital:* {{7}}\n*Current job title:* {{8}}\n*Partnership:* {{9}}\n*Renting/Owning a house?:* {{10}}\n*Are you willing to work inside the location?:* {{11}}\n*Relevant job experience:* {{12}}\n\nYou can view the lead on the following link: {{13}}\n\nKind Regards,\nSector 17"
      },
      {
        "type": "FOOTER",
        "text": "Sector 17"
      }
    ],
    "language": "en",
    "status": "APPROVED",
    "category": "UTILITY",
    "id": "1148463369747405"
  },
  {
    "name": "order_confirmed",
    "parameter_format": "NAMED",
    "components": [
      {
        "type": "HEADER",
        "format": "TEXT",
        "text": "Order Confirmed!"
      },
      {
        "type": "BODY",
        "text": "Hello {{customer_name}},\nThank you for ordering from Sector 17! Your order has been successfully placed. 🎉\nOur team is preparing your order with love! ❤️ We’ll notify you once it’s ready."
      },
      {
        "type": "FOOTER",
        "text": "Enjoy your meal!"
      }
    ],
    "language": "en",
    "status": "APPROVED",
    "category": "UTILITY",
    "sub_category": "CUSTOM",
    "id": "1647034549288992"
  }
  // More objects can follow the same structure.
];

// Function to extract components with dynamic data from a specific data object
function extractDynamicComponents(dataObject) {
  return dataObject.components
    .filter(component => component.text && /{{\d+}}|{{\w+}}/.test(component.text));
}

// Extract dynamic components from the first data object
const dynamicComponents = extractDynamicComponents(data[1]);

// Log the result
console.log(dynamicComponents);
