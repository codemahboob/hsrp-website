/*!
 * BharatPlate Professional Meta Pixel Helper
 * Version 1.0
 */

const BharatPixel = (() => {
  const CONFIG = {
    pixelId: "YOUR_PIXEL_ID",
    debug: false
  };

  let loaded = false;
  const fired = new Set();

  function load() {
    if (loaded) return;
    (function(f,b,e,v,n,t,s){
      if(f.fbq)return;
      n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];
      t=b.createElement(e);t.async=!0;
      t.src=v;
      s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s);
    })(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', CONFIG.pixelId);
    fbq('track','PageView');
    loaded = true;
  }

  function track(event, data = {}) {
    load();
    fbq('track', event, data);
    if (CONFIG.debug) console.log(event, data);
  }

  function custom(event, data = {}) {
    load();
    fbq('trackCustom', event, data);
    if (CONFIG.debug) console.log(event, data);
  }

  function once(key, fn){
    if(fired.has(key)) return;
    fired.add(key);
    fn();
  }

  function bind(id, ev, cb){
    const el=document.getElementById(id);
    if(el) el.addEventListener(ev,cb);
  }

  function init(){
    load();

    bind("plateInput","input",()=>{
      once("plate",()=>{
        track("Lead");
        custom("PlateNumberEntered");
      });
    });

    bind("bookBtn","click",()=>track("InitiateCheckout"));

    ["addrName","addrPhone","addrStreet","addrCity","addrPin"].forEach(id=>{
      bind(id,"focus",()=>once("addr",()=>custom("AddressStarted")));
    });

    bind("payNowBtn","click",()=>track("AddPaymentInfo"));

    let marks=[25,50,75,100];
    window.addEventListener("scroll",()=>{
      const h=document.documentElement.scrollHeight-window.innerHeight;
      if(h<=0) return;
      const p=Math.round(window.scrollY/h*100);
      marks=marks.filter(m=>{
        if(p>=m){
          custom("ScrollDepth",{percent:m});
          return false;
        }
        return true;
      });
    });

    [30,60,120].forEach(sec=>{
      setTimeout(()=>custom("TimeOnPage",{seconds:sec}),sec*1000);
    });
  }

  return {
    init,
    trackPurchase(amount){
      track("Purchase",{value:amount,currency:"INR"});
    },
    trackFailure(reason="Unknown"){
      custom("PaymentFailed",{reason});
    },
    track,
    custom
  };
})();

document.addEventListener("DOMContentLoaded",()=>BharatPixel.init());
