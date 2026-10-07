import type { PhoneValue } from "@/components/form/phone-number-input";

export type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: PhoneValue;
  consent: boolean;
};

export type ButtonProps = {
  children: React.ReactNode;
  onClick: ()=> void;
  variant?: "primary" | "secondary" | "danger";
}


type Geo = {
  lat: string;
  lng: string;
};

type Address = {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
};

type Company = {
  name: string;
  catchPhrase: string;
  bs: string;
};


export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: Address;
  company: Company;
};

export type Todo = {
  id:number;
  title: string;
  name: string;
  description: string;
}

 type Slider = {
  url: string;
  id: number;
  alt: string;
}

export type SlideProps = {
  image: Slider;
}

export type ControlProps = {
  activeIndex: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  total: number;
};

export type Users = {
  userId: number;
  id: number;
  title:string;
  body: string;
}

export type Product = {
  id: number;
  title: string;
  price: number;
  rating: number;
}
