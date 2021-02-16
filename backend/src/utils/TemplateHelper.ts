export class TemplateHelper {
  static loadParams(html: string, params: object): string {
    return TemplateHelper.applyParams(html, params);
  }
  static loadJobParams(html: string, params: object): string {
    return TemplateHelper.applyJobParams(html, params);
  }

  private static applyParams(html: string, params: object): string {
    Object.entries(params).map(([key, value]) => {
      if(key === "sign") {        
        const htmlSign = `<span id="conEdRepSignature" style="display: inline-block; border-bottom: 1px solid ; width: 330px">`
        if(html.includes(htmlSign))
        try {
              html = html.replace(htmlSign,`${htmlSign} <img src ="data:image/png;base64, ${JSON.parse(value).data }" alt="image"  /> `)                    
            } catch (e) {
      }
      }
      else {
        const regexp = new RegExp(`(<\\w+[^>]*id="${key}"[^>]*>)(?:.*)(<\\/\\w*>)`, "g");
        html = html.replace(regexp, `$1${value}$2`);
      }
            
    });    
    return html;
  }

  private static applyJobParams(html: string, params: object): string {
    Object.entries(params).map(([key, value]) => {
      if(key === "locations") {     
        let htmlLocations = ``;
        value.map((item:any,key:any) => {
          htmlLocations += `
          <tr>
            <td colspan="3">
              Location ${key+1} : <span id="lc" style="display: inline-block; border-bottom: 1px solid ; width: 650px">${item.address || ""}</span>
              Structure: <span id="structure" style="display: inline-block; border-bottom: 1px solid ; width: 50px">${item.structure || ""}</span>
            </td>
          <tr>

          `
        })
        html = html.replace(`<tr id="locations">`,htmlLocations)                    
          
      }
      else if(key === "workers") {     
        let htmlWorkers = ``;
        value.map((item:any,key:any) => {
          htmlWorkers += `
          <tr>
            <td colspan="3">
              Worker ${key+1} : <span id="workers" style="display: inline-block; border-bottom: 1px solid ; width: 700px">${item.name}</span>
            </td>
          <tr>

          `
        })
        html = html.replace(`<tr id="workers">`,htmlWorkers)                    
          
      }
      else {
        const regexp = new RegExp(`(<\\w+[^>]*id="${key}"[^>]*>)(?:.*)(<\\/\\w*>)`, "g");
        html = html.replace(regexp, `$1 ${value}$2`);
      }
            
    });    
    return html;
  }
}

export default TemplateHelper;

