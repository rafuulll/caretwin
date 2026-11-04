export const scenario={date:'2 de novembro de 2026',shortDate:'2 nov. 2026',time:'15:30',dayLabel:'Segunda-feira'};
const dates=['19 out.','20 out.','21 out.','22 out.','23 out.','24 out.','25 out.','26 out.','27 out.','28 out.','29 out.','30 out.','31 out.','1 nov.'];
const steps=[5800,6300,5700,6400,5600,5900,6100,6200,5900,6100,6200,4200,4100,4500];
const sleep=[7.1,7.4,7.0,7.2,7.3,7.6,7.1,7.4,7.1,7.7,7.3,6.9,7.05,7.2];
export const people={
 antonio:{id:'antonio',name:'Antônio',full:'Antônio Vieira',initials:'AV',relation:'Você',steps:3800,low:3166,high:4750,fullLow:4800,fullHigh:7200,sleep:432,battery:78,sync:'15:22',device:'CT-2048',hasAlert:true,history:dates.map((date,i)=>({date,steps:steps[i],sleep:sleep[i]}))},
 maria:{id:'maria',name:'Maria',full:'Maria Vieira',initials:'MV',relation:'Familiar',steps:2950,low:2400,high:3600,fullLow:3840,fullHigh:5760,sleep:455,battery:64,sync:'15:18',device:'CT-3192',hasAlert:false,history:dates.map((date,i)=>({date,steps:[4600,4900,4700,5000,4500,4900,4700,4800,4600,5000,4800,4700,4900,4800][i],sleep:[7.4,7.5,7.3,7.6,7.5,7.4,7.8,7.4,7.5,7.6,7.3,7.4,7.6,7.5][i]}))}
};
export const fmt=n=>new Intl.NumberFormat('pt-BR').format(n);
export function duration(minutes){return `${Math.floor(minutes/60)} h ${String(Math.round(minutes%60)).padStart(2,'0')} min`}
