import { registerRootComponent } from 'expo';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './src/store';
import App from './App';
import { createElement, type ComponentProps } from 'react';

const Root = () =>
	createElement(
		Provider,
		{ store } as ComponentProps<typeof Provider>,
		createElement(
			PersistGate,
			{ loading: null, persistor },
			createElement(App),
		),
	);

registerRootComponent(Root);

// registerRootComponent calls AppRegistry.registerComponent('main', () => Root);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
