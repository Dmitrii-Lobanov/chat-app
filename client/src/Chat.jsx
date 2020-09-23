import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useSubscription, gql, useMutation } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { Container, Row, Col, FormInput, Button } from "shards-react";
import './Chat.css';

const link = new WebSocketLink({
  uri: `ws://localhost:4000/`,
  options: {
    reconnect: true
  }
});

const client = new ApolloClient({
  link,
  uri: 'http://localhost:4000/',
  cache: new InMemoryCache()
});


const GET_MESSSAGES = gql`
  subscription {
    messages {
      id
      user
      content
    }
  }
`;

const POST_MESSAGE = gql`
  mutation($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
  }
`;

const Messages = ({ user }) => {
  const { data } = useSubscription(GET_MESSSAGES);
  if(!data) {
    return null;
  }
  return (
    <>
      {data?.messages.map(({ id, user: messageUser, content }) => (
        <div className="chat"
          style={{ justifyContent: user === messageUser ? 'flex-end' : 'flex-start' }}
        >
          { user !== messageUser && (
            <div className="user">
              {messageUser.slice(0,2).toUpperCase()}
            </div>
          ) }
          <div className="content"
            style={{
              background: user === messageUser ? '#58BF56' : '#E5E6EA',
              color: user === messageUser ? 'white' : 'black'
            }}
          >
            {content}
          </div>
        </div>
      ))}
    </>
  )
}

const  Chat = () => {
  const [state, setState] = useState({
    user: 'Jack',
    content: ''
  });

  const [postMessage] = useMutation(POST_MESSAGE);

  const onChange = (event, key) => {
    setState({
      ...state,
      [key]: event.target.value
    })
  }

  const onSend = () => {
    if(!!state.content?.length) {
      postMessage({
        variables: state
      })
    }
    setState({
      ...state,
      content: ''
    })
  }

  return (
    <Container>
      <Messages user={state?.user} />
      <Row>
        <Col xs={2} style={{ padding: 0 }}>
          <FormInput 
            label="User"
            value={state.user}
            onChange={(event) => onChange(event, 'user')}
          />
        </Col>
        <Col xs={8}>
          <FormInput 
            label="Content"
            value={state.content}
            onChange={(event) => onChange(event, 'content')}
            onKeyUp={(event) => {
              if(event.keyCode === 13) {
                onSend();
              }
            }}
          />
        </Col>
        <Col xs={2} style={{ padding: 0 }}>
          <Button onClick={() => onSend()} className="button">Send</Button>
        </Col>
      </Row>
    </Container>
  )
}

export default () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
);