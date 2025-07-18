# DRI Plants in India - Next.js Application

This is a complete Next.js conversion of the Flask DRI Plants application, featuring an interactive map showing Direct Reduced Iron (DRI) plants and biomass availability across India.

## Features

- **Interactive Map**: Explore India's states and districts with detailed plant locations
- **Plant Data Visualization**: View sponge iron plants with detailed information
- **Biomass Data**: Access biomass availability data for different states and districts
- **Distance Calculator**: Calculate distances between different plant locations
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Layer Controls**: Toggle visibility of plants and biomass data
- **Detailed Modals**: Side-by-side view of plant and biomass information

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Highcharts Maps**: Interactive mapping library
- **XLSX**: Excel file processing (for data loading)

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── DRIMapApp.tsx        # Main application component
│   ├── Sidebar.tsx          # Sidebar with controls
│   ├── Modal.tsx            # Generic modal component
│   ├── DistrictDetailsModal.tsx # District details modal
│   └── AutocompleteInput.tsx # Autocomplete input component
└── lib/
    ├── dataLoader.ts        # Data loading utilities
    └── mapUtils.ts          # Map creation utilities
```

## Key Features

### Interactive Mapping
- Click on states to explore districts
- Hover for quick information
- Zoom and pan functionality
- Layer toggles for plants and biomass data

### Distance Calculator
- Autocomplete search for plant names
- Real-time distance calculation between plants
- Easy-to-use interface

### Data Visualization
- Plant locations with detailed information
- Biomass availability by state and district
- Side-by-side comparison modals
- Responsive tables and charts

### Mobile Support
- Responsive design for all screen sizes
- Touch-friendly interface
- Collapsible sidebar for mobile devices

## Data Sources

The application uses mock data for demonstration. In a production environment, you would:

1. Replace mock data in `src/lib/dataLoader.ts` with actual Excel file loading
2. Add real GeoJSON files for accurate geographical boundaries
3. Implement actual distance calculation API

## Customization

### Adding New States/Districts
1. Add GeoJSON files to `public/geojson/states/`
2. Update plant data in `dataLoader.ts`
3. Add biomass data for the new regions

### Styling
- Modify `src/app/globals.css` for global styles
- Update component-specific styles in individual components
- Customize colors and themes using CSS variables

## Deployment

The application can be deployed to any platform that supports Next.js:

- **Vercel**: `npm run build && vercel deploy`
- **Netlify**: `npm run build && npm run export`
- **Docker**: Use the included Dockerfile for containerization

## Performance Optimization

- Dynamic imports for map components to avoid SSR issues
- Lazy loading of GeoJSON data
- Optimized bundle size with tree shaking
- Responsive images and assets

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.