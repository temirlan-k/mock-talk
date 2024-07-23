require('dotenv').config();
import 'dotenv/config';

import { Landing } from "./Landing/Landing";

export default function Home() {
  return (
    <>
      <Landing />
    </>
  );
}
