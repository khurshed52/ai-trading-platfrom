"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { ControlProps, SlideProps, Users } from "@/types/auth";
const images = [
    {
        url: "https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU",
        id: 1,
        alt: "Image 1"

    },
    {
        url: "https://fastly.picsum.photos/id/1/5000/3333.jpg?hmac=Asv2DU3rA_5D1xSe22xZK47WEAN0wjWeFOhzd13ujW4",
        id: 2,
        alt: "Image 2"
    },
    {
        url: "https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ",
        id: 3,
        alt: "Image 3"      
    },
    {
        url: "https://fastly.picsum.photos/id/3/5000/3333.jpg?hmac=GDjZ2uNWE3V59PkdDaOzTOuV3tPWWxJSf4fNcxu4S2g",
        id: 4,
        alt: "Image 4"
    },
    {
        url: "https://fastly.picsum.photos/id/4/5000/3333.jpg?hmac=ghf06FdmgiD0-G4c9DdNM8RnBIN7BO0-ZGEw47khHP4",
        id: 5,
        alt: "Image 5"
    }
]   
export default function Page() {
  const [index, setIndex] = useState(0);

  return (
    <div>
      <Slideshow />
      <Slide image={images[index]} />
      <Control
        activeIndex={index}
        setIndex={setIndex}
        total={images.length}
      />
    </div>
  );
}

const Control = ({activeIndex, setIndex, total}: ControlProps) => {
    const increment = () => {
        if (activeIndex + 1 >= total) {
            setIndex(0)
            return
        }
        setIndex(activeIndex + 1 )
    }

     const decrement = () => {
        if (activeIndex - 1 < 0) {
            setIndex(total - 1)
            return
        }
         setIndex(activeIndex - 1 ) 
    }
    return (
        <div className='flex justify-between mt-2'>
            <button onClick={decrement}>Previous</button>
            <button onClick={increment}>Next</button>
        </div>
    )
}
const Slide = ({ image }: SlideProps) => {
  return (
    <div className="w-full h-full">
      <Image
        src={image.url}
        alt={image.alt}
        className="w-full h-full object-cover"
        width={500}
        height={333}
      />
    </div>
  );
};

const Slideshow = () => {
     const [user, setUser] = useState<Users[]>([])
     useEffect(()=> {
        const fetchUser = async ()=> {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts')
            if(!response.ok){
                throw new Error('failed to fetch user')
            }
            const data: Users[] = await response.json()
            setUser(data)
        } catch(err) {
            console.log(err)
        } finally {
            console.log('fetching user completed')
        }
     }
     fetchUser()
     },[])
    return (
        <div className="flex justify-center">
            <ul> 
                {
                    user.map((user)=> {
                        return (
                            <li key={user.id}>
                                <h3 className="text-lg font-semibold">{user.title}</h3>
                                <p>{user.body}</p>
                            </li>
                        )
                    })
                }
            </ul>
        </div>
    )
}
