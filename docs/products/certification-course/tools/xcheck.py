# xcheck.py: independent re-check of every generated answer in the course (run from the course folder: python3 tools/xcheck.py).
# A separate Python model of the soroban classifies each single-rod move, and every sum, product, quotient and spoken round is re-computed.
import re, glob, sys
def parts(v): return (1 if v>=5 else 0, v%5)
def cls(v,s,d):
    h,e=parts(v); hd,ed=parts(d)
    if s=='+':
        if v+d<=9: return 'free' if e+ed<=4 and h+hd<=1 else 'small'
        c=10-d; hc,ec=parts(c)
        return 'big' if hc<=h and ec<=e else 'both'
    if v>=d: return 'free' if hd<=h and ed<=e else 'small'
    c=10-d; hc,ec=parts(c)
    return 'big' if h+hc<=1 and e+ec<=4 else 'both'
name={'free':'free beads','small':'small friend','big':'big friend','both':'both friends'}
tot=bad=0
for form in ['','-form-b','-form-c']:
    e=open(f'exam{form}.md').read(); k=open(f'exam-key{form}.md').read()
    qs=re.findall(r'^(\d+)\. The ones rod shows (\d)\. (Add|Take away) (\d)\.',e,re.M)
    ks=dict(re.findall(r'^(\d+)\. (.+)$',k.split('key-part-a:start')[1].split('key-part-a:end')[0],re.M))
    for n,v,op,d in qs:
        tot+=1; c=cls(int(v),'+' if op=='Add' else '-',int(d))
        if not ks[n].startswith(name[c]): bad+=1; print('BAD',form,n,v,op,d,ks[n])
t=open('lessons/L10.md').read()
qs=re.findall(r'^(\d+)\. Ones rod shows (\d)\. (Add|Take away) (\d)\.',t,re.M)
ans=t.split('drill-answers:start')[1].split('drill-answers:end')[0]
ks=dict(re.findall(r'(\d+)\) ([a-z ]+?)(?: [−+]|\.)',ans))
for n,v,op,d in qs:
    tot+=1; c=cls(int(v),'+' if op=='Add' else '-',int(d))
    if ks[n].strip()!=name[c]: bad+=1; print('BAD L10',n,v,op,d,ks[n])
for f in sorted(glob.glob('lessons/L*.md')):
    t=open(f).read()
    if '<!-- drills:start -->' not in t: continue
    qpart=t.split('<!-- drills:start -->')[1].split('<!-- drills:end -->')[0]
    apart=t.split('drill-answers:start')[1].split('drill-answers:end')[0]
    secs=re.split(r'^### ([A-Z])\. ',qpart,flags=re.M)[1:]
    for i in range(0,len(secs),2):
        L=secs[i]; body=secs[i+1]
        line=re.search(rf'\*\*{L}\.\*\* (.+)',apart).group(1)
        items=re.findall(r'^(\d+)\. The rod shows (\d)\. (Add|Take away) (\d)\.',body,re.M)
        ak={m[0]:(m[1],m[2]) for m in re.findall(r'(\d+)\) (\d+), ([a-z ]+?)(?: [−+]|(?= ·)|$)',line)}
        for n,v,op,d in items:
            tot+=1; s='+' if op=='Add' else '-'; c=cls(int(v),s,int(d)); val=int(v)+int(d) if s=='+' else int(v)-int(d)
            got=ak.get(n)
            if not got or int(got[0])!=val or got[1].strip()!=name[c]: bad+=1; print('BAD',f,L,n,v,op,d,got)
        # stacked sums: re-add
        st=re.findall(r'^(\d+)\. ([\d,]+(?: [+−] [\d,]+)+)(?:  · child wrote ([\d,]+))?$',body,re.M)
        ans=dict(re.findall(r'(\d+)\) ([\d,]+)',line))
        for n,expr,child in st:
            tot+=1; val=eval(expr.replace('−','-').replace(',',''))
            if int(ans[n].replace(',',''))!=val: bad+=1; print('BAD sum',f,L,n,expr,ans[n],val)
        # products / quotients
        for n,a,op,b in re.findall(r'^(\d+)\. ([\d,]+) ([×÷]) ([\d,]+)$',body,re.M):
            tot+=1; a=int(a.replace(',','')); b=int(b.replace(',',''))
            exp=str(a*b) if op=='×' else (f'{a//b} r {a%b}' if a%b else str(a//b))
            got=re.search(rf'(?:^| ){n}\) ([\d,]+(?: r \d+)?)',line).group(1).replace(',','')
            if got!=exp: bad+=1; print('BAD op',f,L,n,a,op,b,got,exp)
        # spoken rounds "a, b, minus c" with plain totals
        for n,expr in re.findall(r'^(\d+)\. ((?:minus )?\d[\d,]*(?:, (?:minus )?[\d,]+)+)$',body,re.M):
            tot+=1; val=sum((-1 if x.startswith('minus') else 1)*int(x.replace('minus ','').replace(',','')) for x in re.split(r', (?=(?:minus )?\d)',expr))
            got=int(re.search(rf'(?:^| ){n}\) ([\d,]+)',line).group(1).replace(',',''))
            if got!=val: bad+=1; print('BAD round',f,L,n,expr,got,val)
print('checked',tot,'bad',bad)
sys.exit(1 if bad else 0)
