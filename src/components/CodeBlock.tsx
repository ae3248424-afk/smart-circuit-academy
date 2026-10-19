const KW = /\b(void|int|float|bool|const|if|else|for|while|return|true|false|HIGH|LOW|OUTPUT|INPUT|#include)\b/;

export function CodeBlock({ code }: { code: string }) {
  const tokens = code.split(/(\/\/.*$|"[^"]*"|\b\d+\b|\b\w+(?=\()|\b\w+\b)/gm);
  return (
    <pre dir="ltr" className="overflow-x-auto rounded-xl bg-code p-4 font-mono text-xs leading-relaxed text-secondary md:text-sm">
      <code>
        {tokens.map((tk, i) => {
          if (!tk) return null;
          let c = "";
          if (tk.startsWith("//")) c = "text-code-com italic";
          else if (tk.startsWith('"')) c = "text-code-str";
          else if (/^\d+$/.test(tk)) c = "text-code-num";
          else if (KW.test(tk) && /^\w+$/.test(tk)) c = "text-code-key";
          else if (/^\w+$/.test(tk) && code[code.indexOf(tk) + tk.length] === "(") c = "text-code-fn";
          return <span key={i} className={c}>{tk}</span>;
        })}
      </code>
    </pre>
  );
}
