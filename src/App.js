import { css } from 'glamor';
import React from 'react';
import memoize from 'memoize-one';

import ReactWebChat, {
  createBrowserWebSpeechPonyfillFactory,
  createCognitiveServicesSpeechServicesPonyfillFactory,
  createDirectLine
} from 'botframework-webchat';

import createSpeakActivityMiddleware from './createSpeakActivityMiddleware';

css.global('body', {
  backgroundColor: '#EEE'
});

const ROOT_CSS = css({
  height: '100%',
});

const CHAT_CSS = css({
  height: '100%',
  margin: '0 auto'
});

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.mainRef = React.createRef();
    this.activityMiddleware = createSpeakActivityMiddleware();

    const userID = 'dl_' + Math.random().toString(36).substr(2, 9);

    this.state = {
      directLine: createDirectLine({
        domain: '',
        fetch,
        token: props.directLineToken,
        webSocket: true
      }),
      locale: 'en-US',
      botAvatarInitials: '911',
      userAvatarInitials: 'Me',
      userID,
      webSpeechPonyfillFactory: null
    };
  }

  componentDidMount() {
    const sendBox = this.mainRef.current && this.mainRef.current.querySelector('input[type="text"]');
    sendBox && sendBox.focus();

    const fetchAuthorizationToken = memoize(() => {
      return fetch('https://webchat-mockbot.azurewebsites.net/speechservices/token', { method: 'POST' }).then(res => res.json()).then(({ token }) => token);
    }, (x, y) => {
      return Math.abs(x - y) < 60000;
    });

    const speech = this.props.speech;
    if (speech === 'speechservices') {
      createCognitiveServicesSpeechServicesPonyfillFactory({
        authorizationToken: () => fetchAuthorizationToken(Date.now()),
        region: 'westus'
      }).then(webSpeechPonyfillFactory => this.setState(() => ({ webSpeechPonyfillFactory })));
    } else {
      this.setState(() => ({ webSpeechPonyfillFactory: createBrowserWebSpeechPonyfillFactory() }));
    }
  }

  render() {
    const { props: { store }, state } = this;

    return (
      <div
        className={ROOT_CSS}
        ref={this.mainRef}
      >
        <ReactWebChat
          activityMiddleware={this.activityMiddleware}
          botAvatarInitials={state.botAvatarInitials}
          className={CHAT_CSS}
          directLine={state.directLine}
          locale={state.locale}
          sendTimeout={6000}
          store={store}
          userAvatarInitials={state.userAvatarInitials}
          userID={state.userID}
          webSpeechPonyfillFactory={state.webSpeechPonyfillFactory}
        />
      </div>
    );
  }
}
