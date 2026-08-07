// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.

import React from 'react';
import Input from '../../atoms/Input/Input';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Container,
  WrapForm,
  ButtonLogin,
  ButtonFaceBookLogin,
  LabelInput,
  LoadingSpan,
} from './LoginForm.style';
import axios from 'axios';
import { accessTokenAtom, currentUserAtom } from '@src/states/sessions';
import { useSetRecoilState } from 'recoil';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [hasError, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const setAccessToken = useSetRecoilState(accessTokenAtom);
  const setCurrentUser = useSetRecoilState(currentUserAtom);
  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);

    const csrf = document.querySelector("meta[name='csrf-token']")?.getAttribute("content");

    axios.defaults.headers.post['X-CSRF-Token'] = csrf;
    await axios.post('/users/sign_in', {
      user: {
        email: email,
        password: password
      }
    }).then((res) => {
      const {status, data} = res;
      setAccessToken(data.token);
      setCurrentUser(data.user);

      if(status == 200) navigate("/");
    }).catch((err) => {
      setError(true);
    }).finally(() => {
      setLoading(false);
    })
  }

  return (
    <Container>
      <WrapForm>
        <h2>
          Login
        </h2>
        <form>
          <LabelInput htmlFor="email">Email address</LabelInput>
          <Input
            type="text"
            hasError={hasError}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="example@gmail.com">
          </Input>
          <LabelInput htmlFor="password">Password</LabelInput>
          <Input
            type="password"
            hasError={hasError}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="Password">
          </Input>
          <ButtonLogin onClick={handleLogin}>
            {
              loading ? (
                <LoadingSpan />
              ) : 'Login'
            }
          </ButtonLogin>
        </form>
        <ButtonFaceBookLogin>
          Login by FaceBook
        </ButtonFaceBookLogin>
        <div>
          <div>
            <Link to="/">Sign Up</Link>
          </div>
          <div>
            <a href="https://www.google.com/">Forgot password</a>
          </div>
        </div>
      </WrapForm>
    </Container>
  )
}

export default LoginForm
