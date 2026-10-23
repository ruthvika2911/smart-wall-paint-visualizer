export interface Wall{polys:number[][][];strokes:{pts:number[][];size:number}[];color:string;colorName:string;category:string;opacity:number;finish:'matte'|'satin'|'glossy';pattern:string;patOpacity:number;patScale:number}
export interface ColorItem{_id?:string;name:string;hex:string;category?:string;brand?:string;finish?:string}
