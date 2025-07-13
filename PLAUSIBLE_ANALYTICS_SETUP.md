# Plausible Analytics Setup Guide

## Overview
Your LuminaWeb dashboard now includes real-time analytics powered by your self-hosted Plausible instance at `192.168.1.101:8000`.

## What's Been Implemented

### 1. Analytics Script Integration
- ✅ Added Plausible tracking script to `index.html`
- ✅ Configured for domain: `luminaweb.app`
- ✅ Points to your self-hosted instance at `192.168.1.101:8000`

### 2. Dashboard Enhancements
- ✅ Enhanced animations with staggered effects, hover interactions, and floating elements
- ✅ Improved MetricsCard components with better visual effects
- ✅ Added real-time analytics section with live data refresh
- ✅ Integrated Plausible API service for data fetching

### 3. New Components Added
- `src/lib/plausibleAnalytics.ts` - Service for fetching analytics data
- `src/components/analytics/RealTimeAnalytics.tsx` - Real-time analytics dashboard
- Enhanced `src/components/dashboard/MetricsCard.tsx` - Better animations and visual effects

## Setup Instructions

### Step 1: Plausible Configuration
1. Make sure your Plausible instance at `192.168.1.101:8000` is running
2. Add `luminaweb.app` as a site in your Plausible dashboard
3. Configure the site settings as needed

### Step 2: API Key (Optional)
If you want to access the Plausible Stats API for real-time data:

1. In your Plausible dashboard, go to Site Settings → API Keys
2. Generate a new API key
3. Add it to your `.env` file:
   ```
   VITE_PLAUSIBLE_API_KEY=your_api_key_here
   ```

### Step 3: Network Configuration
Ensure your development environment can reach the Plausible instance:
- If running locally, make sure `192.168.1.101:8000` is accessible
- For production, update the IP address in the service configuration

## Features

### Real-time Dashboard
- **Live Metrics**: Unique visitors, page views, bounce rate, session duration
- **Auto-refresh**: Updates every 30 seconds
- **Interactive Charts**: Mini visualizations for trend data
- **Loading States**: Smooth skeleton loading while data loads

### Enhanced Animations
- **Staggered Animations**: Components animate in sequence
- **Hover Effects**: Cards scale and highlight on hover
- **Floating Elements**: Subtle background animations
- **Smooth Transitions**: Page transitions between tabs

### Analytics Integration
- **Mock Data Fallback**: Shows sample data if API is unavailable
- **Error Handling**: Graceful error states
- **Responsive Design**: Works on all screen sizes

## Configuration Options

### Refresh Interval
Change the auto-refresh interval in `RealTimeAnalytics.tsx`:
```typescript
<RealTimeAnalytics refreshInterval={30000} /> // 30 seconds
```

### Data Period
Adjust the analytics period:
```typescript
<RealTimeAnalytics period="7d" /> // 7 days, 30d, 12mo, etc.
```

### Custom IP Address
To change the Plausible instance IP, update `src/lib/plausibleAnalytics.ts`:
```typescript
this.baseUrl = 'http://YOUR_IP:8000';
```

## Troubleshooting

### Analytics Not Loading
1. Check network connectivity to `192.168.1.101:8000`
2. Verify the domain is configured in Plausible
3. Check browser console for errors
4. Ensure the site is generating traffic

### Mock Data Showing
- This is normal when the API is unavailable
- Real data will appear once the API connection is established
- Check the browser network tab for failed requests

### CORS Issues
If you encounter CORS errors, configure your Plausible instance to allow requests from your domain.

## Next Steps

1. **Test the Setup**: Visit your site and check if tracking is working
2. **Verify Data**: Look for real-time data in your Plausible dashboard
3. **Customize**: Adjust colors, refresh intervals, and metrics as needed
4. **Monitor**: Keep an eye on the analytics dashboard for insights

## API Endpoints Used

- `GET /api/v1/stats/aggregate` - Current period metrics
- `GET /api/v1/stats/timeseries` - Historical data
- `GET /api/v1/stats/breakdown` - Detailed breakdowns

## Support

If you encounter any issues:
1. Check the browser console for JavaScript errors
2. Verify your Plausible instance is running
3. Test the API endpoints directly in your browser
4. Review the network requests in developer tools

---

Your dashboard now features beautiful animations and real-time analytics integration! The system will gracefully handle both online and offline scenarios, ensuring a smooth user experience. 