"use client";
import { useRef, useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";

import { multiplyString } from "@/utils";
import { AuthError, signUp } from "@/utils/server";
import { Button, C, GoHomeLogo, Section } from "@/components";
import { useGoTo } from "@/hooks";

import colors from '@/styles/colors.module.scss';
import styles from "../styles.module.scss";


const checkUsername = (str:string) : boolean => {
  if (!str)
    return true;

  return /^(?![0-9\-])[a-z0-9_-]+(?![\-])$/i
         .test(str);
};

const checkEmail = (str:string) : boolean => {
    if (!str)
      return true;

    return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*$/i
           .test(str);
};

const checkPassword = (str:string) : boolean => {
  if (!str)
    return true;

  return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[?!@#$%~^&()\[\]\{\}\.\,\-\+\*\/=\\]).{1,}$/
         .test(str);
};

const LabelTitle = ({ title, subtitle }:{ title:string; subtitle?:string; }) => {
  return (
    <span>
      <C.ACCENT>
        {'> '}
      </C.ACCENT>
      {title}
      {
        subtitle ?
          <C.SECONDARY style={{ fontSize: 12 }}>
            {` (${subtitle})`}
          </C.SECONDARY>
      : null
      }
    </span>
  );
};

const UsernameChecker = ({ username }:{ username:string; }) => {

  return (
    <div className={styles.badInput}>
      <span className={/^[0-9a-zA-Z_\-]*$/.test(username) ? styles.good : styles.bad}>
        Allowed characters:
        <br/>
        {'- '}
        <C.SECONDARY>0-9, a-z, - and _</C.SECONDARY>
      </span>
      <span className={username.length > 2 ? styles.good : styles.bad}>
        Has 3 or more characters.
      </span>
      <span className={/^[0-9]/i.test(username) ? styles.bad : styles.good}>
        Cannot start with numbers.
      </span>
      <span className={/^[\-]/i.test(username) || /[\-]$/i.test(username) ? styles.bad : styles.good}>
        Cannot start or end with -.
      </span>
    </div>
  );
};

const PasswordChecker = ({ password }:{ password:string; }) => {
  const barRatio = password.length >= 8 ? 1 : password.length / 8;
  const color = barRatio === 1 ? colors.green : barRatio <= 0.25 ? colors.red : colors.yellow;

  return (
    <div className={styles.badInput}>
      <span className={barRatio === 1 ? styles.good : styles.bad}>
        Has 8 or more characters.
        <div>
          <div style={{ backgroundColor: color, transform: `scaleX(${barRatio})` }} />
        </div>
      </span>

      <span className={/[0-9]/.test(password) ? styles.good : styles.bad}>
        Contains one or more numbers.
      </span>

      <span className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? styles.good : styles.bad}>
        Contains lower and upper case letters.
      </span>

      <span className={/[?!@#$%~^&()\[\]\{\}\.\,\-\+\*\/=\\]/.test(password) ? styles.good : styles.bad}>
        Contains a special character:
        <br/>
        {'- '}
        <C.SECONDARY>{'?!@#$%~^&()[]{}.,-+*/=\\'}</C.SECONDARY>
      </span>
    </div>
  );
};

export default function RegisterPage() {
  const [redirecting, goto] = useGoTo();

  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confPass, setConfPass] = useState<string>('');

  const [showPass, setShowPass] = useState<boolean>(false);
  const [nameChecker, setNameChecker] = useState<boolean>(false);
  const [passChecker, setPassChecker] = useState<boolean>(false);
  const [cPassChecker, setCPassChecker] = useState<boolean>(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passRef  = useRef<HTMLInputElement>(null);
  const cPassRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<AuthError | null>(null);

  const isOK = username.length > 2
            && email
            && password.length > 7
            && checkUsername(username)
            && checkEmail(email)
            && checkPassword(password)
            && password === confPass;

  const onSubmit = async () => {
    if (isOK) {
      const { data, error } = await signUp(username, email, password);

      if (error)
        setError(error);

      else if (data) {
        setError(null);
        goto(`/checkmail?uuid=${data.user?.id}`, 'replace');
      }
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Section title="Create Account" className={`${styles.section}`} containerClassName={styles.sectionContent} containerStyle={{ borderStyle: redirecting ? 'dashed' : 'solid' }} isCard centered>
          <GoHomeLogo
            goto={goto}
            redirecting={redirecting}
            className={styles.image}
            style={{ filter: showPass ? "saturate(0) blur(3px)" : "" }}
          />
          <div className={styles.name}>
            <C.SECONDARY>
              {'•-{ '}
              <span style={{ color: showPass ? colors.quinary : colors.accent }}>
                The Winery
              </span>
              {' }-•'}
            </C.SECONDARY>
          </div>

          <form>
          <label>
              <LabelTitle title="Username" subtitle={username.includes("69") ? "nice" : undefined} />
              <input
                name="username"
                autoComplete="username"
                spellCheck={false}
                type="text"
                title=""
                value={username}
                placeholder="username"
                onChange={e => setUsername(e.target.value)}
                required
                onFocus={() => setNameChecker(true)}
                onBlur={() => setNameChecker(!checkUsername(username) || username.length < 3)}
                onKeyDown={e => {
                  if (e.key === 'Enter')
                    emailRef.current?.focus();
                }}
              />
              { nameChecker ? <UsernameChecker username={username} /> : null }
            </label>

            <label>
              <LabelTitle title="Email" />
              <input
                name="email"
                autoComplete="email"
                spellCheck={false}
                type="email"
                title=""
                value={email}
                placeholder="user@example.com"
                onChange={e => setEmail(e.target.value)}
                ref={emailRef}
                required
                onKeyDown={e => {
                  if (e.key === 'Enter')
                    passRef.current?.focus();
                }}
              />
              { !checkEmail(email) ?
                  <div className={styles.badInput}>
                    <span className={styles.bad}>
                      Invalid email address.
                    </span>
                  </div>
              : null }
            </label>

            <label>
              <LabelTitle title="Password" />
              <div className={styles.passwordContainer}>
                <input
                  name="password"
                  autoComplete="new-password"
                  spellCheck={false}
                  type={showPass ? "text" : "password"}
                  title=""
                  value={password}
                  placeholder="********"
                  onChange={e => setPassword(e.target.value)}
                  ref={passRef}
                  required
                  onFocus={() => setPassChecker(true)}
                  onBlur={() => setPassChecker(!checkPassword(password))}
                  onKeyDown={e => {
                    if (e.key === 'Enter')
                      cPassRef.current?.focus();
                  }}
                />
                <div
                  title={showPass ? "Hide Password" : "Show Password"}
                  onClick={() => setShowPass(p => !p)}
                >
                  {showPass ? <IoEyeOff id="closed" /> : <IoEye id="open" />}
                </div>
              </div>
              { passChecker ? <PasswordChecker password={password} /> : null }
            </label>

            <label>
              <LabelTitle title="Confirm Password" />
              <input
                name="password"
                autoComplete="new-password"
                spellCheck={false}
                type={showPass ? "text" : "password"}
                title=""
                value={confPass}
                placeholder={password ? multiplyString("*", password.length) : "********"}
                onChange={e => setConfPass(e.target.value)}
                ref={cPassRef}
                required
                onFocus={() => setCPassChecker(true)}
                onBlur={() => setCPassChecker(password.length > 0 && confPass.length > 0 && password !== confPass)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && isOK)
                    onSubmit();
                }}
              />
              { cPassChecker ?
                <div className={styles.badInput}>
                  <span className={password.length > 0 && password === confPass ? styles.good : styles.bad}>
                    { password.length === 0 || !checkPassword(password)
                    ? "Enter a valid password first."
                    : "Matches password."}
                  </span>
                </div>
                : null }
            </label>

            <Button
              title="Sign up"
              onClick={onSubmit}
              disabled={!isOK}
              className={styles.button}
            />
          </form>
          {
            error ?
            <span className={styles.error}>
              <C.RED>
                {error.message ?? "An error has occurred"}
                <C.SECONDARY>[{error.status}]</C.SECONDARY>
              </C.RED>
            </span>
            : null
          }
        </Section>

        <Section isCard>
          <span className={styles.haveAcc}>
            Already have an account? <a href="/login">log in</a> now!
          </span>
        </Section>
      </div>
    </div>
  );
}
