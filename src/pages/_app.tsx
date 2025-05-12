// import App from 'next/app';
// import { Component } from 'react';
import type { AppProps } from 'next/app';
import './styles/globals.css';

export default function App({ Component, pageProps }: AppProps){
    return <Component {...pageProps} />;
}