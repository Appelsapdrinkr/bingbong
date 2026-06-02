import { registerRootComponent } from 'expo';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import { createElement, type ComponentProps } from 'react';

const Root = () =>
	createElement(
		Provider,
		{ store } as ComponentProps<typeof Provider>,
		createElement(App),
	);

registerRootComponent(Root);

// registerRootComponent calls AppRegistry.registerComponent('main', () => Root);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
