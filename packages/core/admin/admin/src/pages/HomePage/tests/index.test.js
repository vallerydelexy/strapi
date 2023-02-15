import React from 'react';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { IntlProvider } from 'react-intl';
import { useAppInfos } from '@strapi/helper-plugin';
import { ThemeProvider, lightTheme } from '@strapi/design-system';
import HomePage from '../index';
import { useModels } from '../../../hooks';

jest.mock('@strapi/helper-plugin', () => ({
  ...jest.requireActual('@strapi/helper-plugin'),
  useAppInfos: jest.fn(() => ({ communityEdition: true })),
  useTracking: jest.fn(() => ({ trackUsage: jest.fn() })),
  useGuidedTour: jest.fn(() => ({
    isGuidedTourVisible: false,
    guidedTourState: {
      apiTokens: {
        create: false,
        success: false,
      },
      contentManager: {
        create: false,
        success: false,
      },
      contentTypeBuilder: {
        create: false,
        success: false,
      },
    },
  })),
}));

jest.mock('../../../hooks', () => ({
  useModels: jest.fn(),
}));

const history = createMemoryHistory();

const App = (
  <ThemeProvider theme={lightTheme}>
    <IntlProvider locale="en" messages={{}} textComponent="span">
      <Router history={history}>
        <HomePage />
      </Router>
    </IntlProvider>
  </ThemeProvider>
);

describe('Homepage', () => {
  useModels.mockImplementation(() => ({
    isLoading: false,
    collectionTypes: [],
    singleTypes: [],
  }));

  it('renders and matches the snapshot', () => {
    const {
      container: { firstChild },
    } = render(App);

    expect(firstChild).toMatchSnapshot();
  });

  test('should display discord link for CE edition', () => {
    const { getByRole } = render(App);

    expect(getByRole('link', { name: /get help/i })).toHaveAttribute(
      'href',
      'https://discord.strapi.io'
    );
  });

  test('should display support link for EE edition', () => {
    useAppInfos.mockImplementation(() => ({ communityEdition: false }));
    const { getByRole } = render(App);

    expect(getByRole('link', { name: /get help/i })).toHaveAttribute(
      'href',
      'https://support.strapi.io/support/home'
    );
  });

  it('should display particular text and action when there are no collectionTypes and singletypes', () => {
    const { getByText, getByRole } = render(App);

    expect(
      getByText(
        'Congrats! You are logged as the first administrator. To discover the powerful features provided by Strapi, we recommend you to create your first Content type!'
      )
    ).toBeInTheDocument();
    expect(getByRole('button', { name: 'Create your first Content type' })).toBeInTheDocument();
  });

  it('should display particular text and action when there are collectionTypes and singletypes', () => {
    useModels.mockImplementation(() => ({
      isLoading: false,
      collectionTypes: [{ uuid: 102 }],
      singleTypes: [{ isDisplayed: true }],
    }));

    const { getByText, getByRole } = render(App);

    expect(
      getByText(
        'We hope you are making progress on your project! Feel free to read the latest news about Strapi. We are giving our best to improve the product based on your feedback.'
      )
    ).toBeInTheDocument();
    expect(getByRole('link', { name: 'See more on the blog' })).toBeInTheDocument();
  });
});
