// import App from 'next/app';
// import { Component } from 'react';
import type { AppProps } from 'next/app';
import './styles/globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import {config} from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;
import './styles/weather.css';

export default function App({ Component, pageProps }: AppProps){
    return <Component {...pageProps} />;
}