import { Helmet } from 'react-helmet-async';

export default function SEO({
  title = 'Tuklas — Youth Career Intelligence',
  description = 'AI-Powered Career Intelligence Platform. Discover your career path with personalized recommendations, skills gap analysis, and TESDA training matches.',
  image = '/logo-color.png',
  url = 'https://tuklas.ph',
  type = 'website',
  keywords = 'career guidance, TESDA, skills training, AI career matching, Philippine jobs, youth employment, career pathways',
}) {
  const fullUrl = url.startsWith('http') ? url : `https://tuklas.ph${url}`;
  const fullImage = image.startsWith('http') ? image : `https://tuklas.ph${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="Tuklas" />
      <meta property="og:locale" content="en_PH" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="Tuklas Team" />
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
}
