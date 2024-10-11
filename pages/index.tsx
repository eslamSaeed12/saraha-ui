import { useParams, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import logo from "./main.jpg";
import axios, { AxiosError } from "axios";
import { DotLoader } from "react-spinners";
interface ILocation {
  lat: number | null;
  lon: number | null;
}
const uri: string = process.env.NEXT_PUBLIC_API as any;

export default function Home() {
  const [location, setLocation] = useState<ILocation>({ lat: null, lon: null });
  const params = useSearchParams();
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [alert, setAlert] = useState(false);

  const onFormSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const data = {
        target: params.get("target"),
        body: message,
        lat: location.lat,
        lon: location.lon,
      };
      try {
        setLoader(true);
        const res = await axios.post(`${uri}/api/messages`, data);
        setMessage("");
        setAlert(true)
        setTimeout(()=>{
            setAlert(false);
        },3000)
      } catch (err) {
        if (err instanceof AxiosError) {
          const res = err?.response?.data;
          if (res && err.status == 400) {
            setMessageError(res?.message[0]);
          } else {
            setMessageError("حدث خطأ ما");
          }
        } else {
          setMessageError("حدث خطأ ما");
        }
      } finally {
        setLoader(false);
      }
    },
    [message, location, params]
  );
  useEffect(() => {
    if (window?.navigator?.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (err) => {
          console.log(err);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);
  return (
    <div>
      <header>
        <div className="container">
          <nav>
            <ul>
              <li>
                <a href="#">العربية</a>
              </li>
              <li>
                <a href="#">اتصل بنا</a>
              </li>
              <li>
                <a href="#">تسجيل الدخول عن طريق الفيسبوك</a>
              </li>
              <li>
                <a href="#">تسجيل</a>
              </li>
              <li>
                <a href="#">دخول</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="container main">
        <div className="message-box">
          <div className="flex flex-row justify-center">
            <Image
              src={logo}
              alt="sarah-logo"
              style={{
                maxWidth: 100,
                borderRadius: "100%",
                border: "1px solid rgba(15,186,178,.1)",
              }}
            />
          </div>
          <h2 className="font-bold text-lg capitalize mt-4">
            {params.get("target")}
          </h2>
          <p>اجعل رسالتك بناءة :)</p>
          <form onSubmit={(e) => onFormSubmit(e)}>
            <textarea
              placeholder="اكتب رسالتك هنا"
              value={message}
              required={true}
              minLength={5}
              maxLength={255}
              onChange={(t) => {
                setMessageError("");
                setAlert(false)
                setMessage(t.target.value);
              }}
            ></textarea>
            <label className="text-red-700 block">{messageError}</label>
            <button type="submit">
              {loader ? <DotLoader color="white" size={15} /> : "ارسال"}
            </button>
          </form>
        </div>
      </div>
      {alert ? (
        <div
          className="absolute bottom-0 left-0 w-full"
          style={{ height: 100 }}
        >
          <div
            className="bg-green-500 text-white px-4 py-3 rounded absolute right-10 bottom-10"
            role="alert"
            style={{ width: 300 }}
          >
            <strong className="font-bold ml-2">نجاح!</strong>
            <span className="block sm:inline">تم إرسال الرسالة بنجاح!</span>
            <span className="absolute top-0 bottom-0 left-0 z-10 px-4 py-3 cursor-pointer">
              x
            </span>
          </div>
        </div>
      ) : null}

      <footer>
        <div className="container">
          <div className="footer-row">
            <div className="footer-column">
              <p>
                1. يمكنك إنشاء حساب صراحة خاص بك بكل سهولة من{" "}
                <a href="#">هنا</a>
              </p>
              <p>
                2. يمكنك نشر الحساب الخاص بك على Twitter أو Facebook أو Skype أو
                أي مكان تريده
              </p>
              <p>3. يمكنك قراءة ما كتبه الناس عنك</p>
              <p>4. من المستحسن أن تنشر الرسائل المفضلة لديك</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© جميع الحقوق محفوظة - موقع صراحة © 2024</p>
            <a href="#">شروط الاستخدام والخصوصية</a> |
            <a href="#">انضم للمجموعة</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
