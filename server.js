require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

const API_KEY = process.env.KLAVIYO_API_KEY;
const LIST_ID = process.env.KLAVIYO_LIST_ID;

app.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const payload = {
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          custom_source: 'Website Newsletter Form',
          profiles: {
            data: [
              {
                type: 'profile',
                attributes: {
                  email: email,
                  subscriptions: {
                    email: {
                      marketing: {
                        consent: 'SUBSCRIBED'
                      }
                    }
                  }
                }
              }
            ]
          }
        },
        relationships: {
          list: {
            data: {
              type: 'list',
              id: LIST_ID
            }
          }
        }
      }
    };

    const response = await axios.post(
      'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/',
      payload,
      {
        headers: {
          Authorization: `Klaviyo-API-Key ${API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          revision: '2024-05-15'
        }
      }
    );

    res.json({ message: '✅ Subscribed successfully!', data: response.data });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    res.status(500).json({
      error: '❌ Subscription failed',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
