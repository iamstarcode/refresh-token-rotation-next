import tw, { css } from "twin.macro"

const stylesBase = css`
  .light {
    --bg-primary: #bf3415;
    --bg-secondary: #f1f5f9;
    --text-primary: #475569;
    --text-secondary: #1e293b;
    --color-primary: #e11d48;
    --base-100: #ffffff;
  }
  .dark {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --text-primary: #cbd5e1;
    --text-secondary: #ffffff;
    --color-primary: #2563eb;
    --base-100: #2B2843;
  }
  body {
    ${tw`bg-base text-primary transition-all duration-200`}
  }
`

export default stylesBase
