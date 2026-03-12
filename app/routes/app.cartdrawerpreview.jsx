import React, { useState, useEffect } from "react";
import styled from "styled-components";

const UNIT_PRICE = 1498;
const GIFT_PRICE = 799;

/* -------------------- STYLES -------------------- */
const Body = styled.div`
  font-family: "Helvetica Neue", Arial, sans-serif;
  background: transparent;           /* was #f2f2f2 */
  display: flex;
  justify-content: center;
  min-height: auto;                  /* was 100vh */
`;


const CartWrapper = styled.div`
  width: 100%;
  max-width: 480px;
  min-height: auto;                  
  position: relative;
  padding-bottom: 0;                
  background: ${({ $background }) => $background || "#fff"};     
  border-radius: 12px;              
  overflow: hidden;             
`;

const CartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  border-bottom: 1px solid #eee;
background:#fff;

`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
`;

const CountdownBanner = styled.div`
  background:${({$countdownbg})=> $countdownbg || "#000"};
  color: #fff;
  display: flex;
  justify-content: space-between;
  padding: 10px 18px;
  border-radius:${({$timerborderradius})=> $timerborderradius+ 'px' || "0px" };
  display:${({$timereanble})=>$timereanble ? 'flex': 'none'};
`;

const CountdownLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Timer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TimeBox = styled.span`
  background: ${({$countchipbg}) => $countchipbg || '#fff'};
  color: ${({$countchiptext})=> $countchiptext || '#000'};
  border-radius:${({$timerborderradius})=> $timerborderradius+ 'px' || '0px'};
  font-weight: 800;
  padding: 3px 8px;
  min-width: 34px;
  text-align: center;
 
`;

const ShippingBanner = styled.div`
  background: #8b1a1a;
  color: #fff;
  text-align: center;
  padding: 9px 18px;
  display:${({$carouselEnable})=> $carouselEnable?'block':"none"};
  background:${({$carouselbg})=> $carouselbg || "#000" };
  color:${({$carouselTextcolor})=> $carouselTextcolor || "#fff" };  
`;

const CartItem = styled.div`
  padding: 16px 18px;
  border-bottom: 1px solid #f0f0f0;
  background:#fff;
  margin-top:10px;
  border-radius:${({ $itemborderradius }) => $itemborderradius+ 'px' || "10px"}; 
  margin:10px;
`;

const ItemInner = styled.div`
  display: flex;
  gap: 14px;
`;

const ItemImage = styled.img`
  width: 110px;
  height: 135px;
  object-fit: cover;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 700;
  font-size: 15px;
  color: ${({$itemcolor})=> $itemcolor || '#000'}
`;

const ItemVariant = styled.div`
  opacity: .6;
  font-size: 13px;
  margin-bottom: 10px;
   color: ${({$itemcolor})=> $itemcolor || '#000'}
`;

const Pricing = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
`;

const Price = styled.span`
  font-weight: 700;
  color: ${({$itemcolor})=> $itemcolor || '#000'}
`;

const Mrp = styled.span`
  text-decoration: line-through;
  color: #aaa;
`;

const Coupon = styled.span`
  background: #22a850;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
`;

const QtyRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
`;

const QtyControl = styled.div`
  display: flex;
  border: 1px solid #ccc;
`;

const QtyBtn = styled.button`
  width: 36px;
  height: 34px;
  border: none;
  background: white;
  font-size: 20px;
  cursor: pointer;
`;

const QtyValue = styled.div`
  width: 42px;
  text-align: center;
  line-height: 34px;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
`;

const RecsSection = styled.div`
  padding: 20px 18px;
  display:${({$collectionenablee})=> $collectionenablee? 'block': 'none'};
 
`;

const RecTitle = styled.div`
  font-size: 18px;
  color: #555;
  margin-bottom: 16px;
`;

const RecScroll = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
`;

const RecCard = styled.div`
  background: #fff;
  border-radius: 10px;
  min-width: 160px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.1);
`;

const RecImageWrap = styled.div`
  position: relative;
`;

const RecImage = styled.img`
  width: 100%;
  height: 170px;
  object-fit: cover;
`;

const RecAddBtn = styled.button`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: white;
  border: none;
  padding: 6px 16px;
  font-weight: 700;
  border-radius: 6px;
`;

const RecInfo = styled.div`
  padding: 10px;
`;

const GiftWrapRow = styled.div`
  padding: 14px 18px;
  border-top: 1px solid #eee;
  background:#fff;
  display:${({$gifteanble})=> $gifteanble? 'block': 'none'};
`;

const CheckoutBar = styled.div`
  position: sticky;                  /* was fixed */
  bottom: 0;
  width: 100%;
  max-width: none;                   /* was 480px */
  background: white;
  border-top: 1px solid #ddd;
  display: flex;
  padding: 10px;
  z-index: 5;                        /* ensures it stays above content */
`;

const TotalBlock = styled.div`
  padding: 10px 18px;
 
`;

const TotalAmount = styled.div`
  font-weight: 800;
  font-size: 18px;
`;

const CheckoutBtn = styled.button`
  flex: 1;
  background: ${({ $check_btn_bg }) => $check_btn_bg || "#6b0f1a"};
  color: ${({ $check_btn_color }) => $check_btn_color || "#fff"};
  border: none;
  font-weight: 800;
  letter-spacing: 2px;
  cursor: pointer;
  border-radius: ${({ $check_btn_rad }) =>
    $check_btn_rad != null ? `${$check_btn_rad}px` : "10px"};
`;

/* -------------------- COMPONENT -------------------- */

 function Cart({
    cartDrawerBackgroundColor,
    cartDrawerItemBorderRadius,
    cartDrawerItemTextColor,
    CheckoutButtonColor,
    checkoutButtonBackground,
    CheckoutButtonBorderRadius,

    countdownEnable,
    countdownBackgroundColor,
    countdownChipBackgroundColor,
    countdownTextColor,
    countdownChipTextColor,
    countdownBorderRadius,

    productEnable,
    collectionEnable,

    announcementBarEnablee,
    announcementBartext,
    announcementBarbg,
    announcementBartextcolor

 }) {

  const [qty, setQty] = useState(2);
  const [giftWrap, setGiftWrap] = useState(false);
  const [seconds, setSeconds] = useState(11 * 3600 + 7 * 60 + 13);


  let announcement_bat_text = announcementBartext.split(',')

  console.log("announcement_bat_text", announcement_bat_text);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  const total = UNIT_PRICE * qty + (giftWrap ? GIFT_PRICE : 0);

  return (
    <Body>

      <CartWrapper  $background={cartDrawerBackgroundColor}>

        <CartHeader>
          <h2>Your Cart ({qty})</h2>
          <CloseBtn>✕</CloseBtn>
        </CartHeader>


        <CountdownBanner $timereanble={countdownEnable} $countdownbg = {countdownBackgroundColor} $timerborderradius={countdownBorderRadius}>

          <CountdownLeft>
            <span style={{color:`${countdownTextColor}`, fontSize:'1rem'}}>Hurry ! Offer ends in</span>
          </CountdownLeft>

          <Timer>
            <TimeBox $timerborderradius={countdownBorderRadius}  $countchipbg={countdownChipBackgroundColor} $countchiptext={countdownChipTextColor}>{hrs}</TimeBox> :
            <TimeBox $timerborderradius={countdownBorderRadius} $countchipbg={countdownChipBackgroundColor}  $countchiptext={countdownChipTextColor}>{mins}</TimeBox> :
            <TimeBox $timerborderradius={countdownBorderRadius}  $countchipbg={countdownChipBackgroundColor} $countchiptext={countdownChipTextColor}>{secs}</TimeBox>
          </Timer>

        </CountdownBanner>


        <hr style={{ margin: "0", background: "#fff", height: "14px", outline:'none', border:'none' }} />

        <ShippingBanner
            $carouselEnable ={announcementBarEnablee}
            $carouselText = {announcementBartext}
            $carouselbg = {announcementBarbg}
            $carouselTextcolor ={announcementBartextcolor}
        >
         {

            // announcement_bat_text.map((item, index)=>{ return(
            //         <>
            //          {index=0? ( <div class="ann_item">{item}</div>): ''}
            //         </>

            // );})
            announcement_bat_text[0]
         }
        </ShippingBanner>



        {/* announcementBarEnablee,
    announcementBartext,
    announcementBartextcolor,
    announcementBarbg */}
        <CartItem $itemborderradius={cartDrawerItemBorderRadius}>

          <ItemInner>

            <ItemImage src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&q=80" />

            <ItemDetails >

              <ItemName $itemcolor={cartDrawerItemTextColor}>Elaia 3/4 Sleeve Top Grey Marle</ItemName>
              <ItemVariant $itemcolor={cartDrawerItemTextColor} >US 0 / Grey Marle</ItemVariant>

              <Pricing>
                <Price $itemcolor={cartDrawerItemTextColor}>₹1,498</Price>
                <Mrp>₹1,598</Mrp>
                <Coupon>FIXED100</Coupon>
              </Pricing>

              <QtyRow>

                <QtyControl>

                  <QtyBtn onClick={() => qty > 1 && setQty(qty - 1)}>
                    −
                  </QtyBtn>

                  <QtyValue>{qty}</QtyValue>

                  <QtyBtn onClick={() => setQty(qty + 1)}>
                    +
                  </QtyBtn>

                </QtyControl>

              </QtyRow>

            </ItemDetails>

          </ItemInner>

        </CartItem>

        <RecsSection $collectionenablee={collectionEnable}>

          <RecTitle>You May Also Like</RecTitle>

          <RecScroll>

            <RecCard>
              <RecImageWrap>
                <RecImage src="https://images.unsplash.com/photo-1772442088712-df1780cbb709?q=80&w=870" />
                <RecAddBtn>Add</RecAddBtn>
              </RecImageWrap>

              <RecInfo>
                Here One Moment 3/4... <br />
                <strong>Rs. 899</strong>
              </RecInfo>
            </RecCard>

            <RecCard>
              <RecImageWrap>
                <RecImage src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80" />
                <RecAddBtn>Add</RecAddBtn>
              </RecImageWrap>

              <RecInfo>
                Elaia 3/4 Sleeve To... <br />
                <strong>Rs. 599</strong>
              </RecInfo>
            </RecCard>

          </RecScroll>

        </RecsSection>

        <GiftWrapRow $gifteanble = {productEnable}>

          <label>
            <input
              type="checkbox"
              checked={giftWrap}
              onChange={(e) => setGiftWrap(e.target.checked)}
            />

            🎁 <strong>Gift wrap it</strong> @Rs. 799 only

          </label>

        </GiftWrapRow>

        <CheckoutBar>

          <TotalBlock>
            Estimated Total
            <TotalAmount>
              ₹{total.toLocaleString("en-IN")}.00
            </TotalAmount>
          </TotalBlock>



          <CheckoutBtn 
          $check_btn_color= {CheckoutButtonColor}
          $check_btn_bg = {checkoutButtonBackground}
          $check_btn_rad = {CheckoutButtonBorderRadius}
          
          >
            CHECKOUT
          </CheckoutBtn>

        </CheckoutBar>

      </CartWrapper>

    </Body>
  );
}

export default Cart;
