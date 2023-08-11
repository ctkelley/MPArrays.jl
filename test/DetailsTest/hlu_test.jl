function hlu_test()
N=100;
h=1.0/(N+1);
X=collect(h:h:1-h);
K=[ker(x,y) for x in X, y in X];
A=I + .1 * K;
Ah=Float16.(A);
AFt=lu(A);
dok = (norm(I - AFt\A) < 1.e-12)
Aht=hlu(Ah);
hok= (norm(I - Aht\Ah) < 1.e-3)
hluok=dok && hok
return hluok
end

function ker(x,y)
ker=sin.(x-y)
return ker
end
