from pathlib import Path
p=Path('/workspace/sites/airegin/dist')
# A purpose-drawn fictional neighbourhood. Concept art, never presented as gameplay.
def building(x,y,w,h,c,roof,label=''):
 s=f'<g transform="translate({x} {y})"><path d="M0 0 {w} -24 {w+40} 0 40 24Z" fill="{roof}"/><path d="M0 0 40 24 40 {h+24} 0 {h}Z" fill="#bda278"/><path d="M40 24 {w+40} 0 {w+40} {h} 40 {h+24}Z" fill="{c}"/>'
 for row in range(max(1,h//45)):
  for col in range(max(1,(w-20)//36)):
   xx=53+col*34; yy=33+row*39-col*6
   s+=f'<path d="M{xx} {yy} l18 -4 v23 l-18 4Z" fill="#173e35"/><path d="M{xx+8} {yy-1} v22" stroke="#f5e9c9" stroke-width="2"/>'
 if label:s+=f'<text x="{w/2+23}" y="{h+6}" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="bold" fill="#173e35">{label}</text>'
 return s+'</g>'
svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 640"><rect width="1440" height="640" fill="#bbd5bc"/><path d="M-100 340 830 0 1570 290 580 680Z" fill="#d4c5a3"/><path d="M-100 430 830 85 1510 350 620 690Z" fill="#63766a"/><path d="m-20 455 850-315 590 230" fill="none" stroke="#dfd9b8" stroke-width="4" stroke-dasharray="30 26"/><path d="m440 55 0 100 550 410" stroke="#63766a" stroke-width="80" fill="none"/><path d="m440 55 0 100 550 410" stroke="#dfd9b8" stroke-width="3" stroke-dasharray="26 24" fill="none"/>'
for args in [(100,200,160,100,'#eadab5','#a45639',''),(290,120,115,90,'#f0d28c','#864b35',''),(555,83,140,130,'#d0d9ad','#23564a','SCHOOL'),(820,60,160,85,'#e7dbb8','#ad6441',''),(1020,140,150,125,'#dbbf8e','#7d4837',''),(1180,220,120,95,'#d9dfbd','#356b52',''),(70,430,190,80,'#e8c581','#864b35','MARKET'),(340,440,150,95,'#e9d9b4','#427153',''),(615,350,145,85,'#d4b477','#a45639','COMMUNITY HALL'),(900,410,165,115,'#e5d0a5','#44664d',''),(1160,475,150,75,'#c2cc9b','#a45639','')]:svg+=building(*args)
# trees with deliberate flat shapes
for x,y in [(70,300),(280,310),(500,78),(748,210),(1000,290),(1320,380),(815,500),(530,590),(1340,140)]:svg+=f'<g transform="translate({x} {y})"><path d="M0 0v45" stroke="#584c31" stroke-width="9"/><ellipse cy="-14" rx="29" ry="34" fill="#2e6047"/><ellipse cx="-19" cy="-3" rx="20" ry="25" fill="#427650"/><ellipse cx="18" cy="-9" rx="20" ry="26" fill="#34694a"/></g>'
# danfo and small vehicles
for x,y in [(580,278),(1090,325),(313,389)]:svg+=f'<g transform="translate({x} {y})"><path d="m0 0 50 -18 32 15 -50 20Z" fill="#f5be3c"/><path d="m0 0 32 17v26L0 26Z" fill="#d89d22"/><path d="m32 17 50-20v26L32 43Z" fill="#e7ad23"/><path d="m39 19 35-13v11L39 30Z" fill="#264c40"/><path d="m3 7 23 12v10L3 17Z" fill="#264c40"/><circle cx="42" cy="39" r="7" fill="#1a352c"/><circle cx="75" cy="26" r="7" fill="#1a352c"/></g>'
for x,y in [(230,373),(760,295),(830,350),(1150,407),(1020,370),(530,345)]:svg+=f'<g transform="translate({x} {y})"><circle cy="-12" r="5" fill="#69452d"/><path d="M-5-5h10l3 17H-8Z" fill="#f4ead0"/><path d="M-4 12v12m8-12v12" stroke="#244f3d" stroke-width="4"/></g>'
svg+='</svg>'; (p/'neighbourhood.svg').write_text(svg)
