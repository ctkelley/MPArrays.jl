var documenterSearchIndex = {"docs":
[{"location":"Details/#More-than-you-want-to-know","page":"More than you want to know","title":"More than you want to know","text":"","category":"section"},{"location":"Details/#Interprecision-Transfers:-Part-I","page":"More than you want to know","title":"Interprecision Transfers: Part I","text":"","category":"section"},{"location":"Details/","page":"More than you want to know","title":"More than you want to know","text":"    n      LU64       LU32       HPS        MPS        LPS   LU32/MPS\n  512    1.0e-03    9.7e-04    5.0e-05    1.9e-04    2.8e-05 5.1e+00\n 1024    3.8e-03    3.0e-03    1.9e-04    4.2e-04    1.0e-04 7.2e+00\n 2048    2.2e-02    1.4e-02    8.9e-04    3.7e-03    4.1e-04 3.8e+00\n 4096    1.5e-01    8.3e-02    4.8e-03    1.5e-02    2.3e-03 5.7e+00\n 8192    1.1e+00    6.0e-01    2.0e-02    5.9e-02    9.8e-03 1.0e+01","category":"page"},{"location":"Details/#Half-Precision","page":"More than you want to know","title":"Half Precision","text":"","category":"section"},{"location":"Details/","page":"More than you want to know","title":"More than you want to know","text":"Using half precision will not speed anything up, in fact it will make  the solver slower. The reason for this is that LAPACK and the BLAS  do not (YET) support half precision, so all the clever stuff in there is missing. We provide a half precision LU factorization /src/Factorizations/hlu!.jl that is better than nothing.  It's a hack of Julia's  generic_lu! with threading and a couple compiler directives. Even so, it's 2.5 – 5 x slower than a  double precision LU. Half precision support is coming  (Julia and Apple support it in hardware!) but for now, at least for desktop computing, half precision is for research in iterative refinement, not applications. ","category":"page"},{"location":"Details/","page":"More than you want to know","title":"More than you want to know","text":"Here's a table (created with  /CodeForDocs/HalfTime.jl ) that illustrates the point. In the table we compare timings for LAPACK's LU to the LU we compute with hlu!.jl. The matrix is  I-8000*G.","category":"page"},{"location":"Details/","page":"More than you want to know","title":"More than you want to know","text":"      N       F64       F32       F16     F16/F64 \n     1024  3.65e-03  2.65e-03  5.26e-03  1.44e+00 \n     2048  2.26e-02  1.41e-02  3.70e-02  1.64e+00 \n     4096  1.55e-01  8.53e-02  2.55e-01  1.65e+00 \n     8192  1.15e+00  6.05e-01  4.23e+00  3.69e+00 ","category":"page"},{"location":"Details/","page":"More than you want to know","title":"More than you want to know","text":"The columns of the table are the dimension of the problem, timings for double, single, and half precision, and the ratio of the half precision timings to double. The timings came from Julia 1.10-beta2 running on an Apple M2 Pro with 8 performance cores.","category":"page"},{"location":"Details/","page":"More than you want to know","title":"More than you want to know","text":"Half precision is also difficult to use properly. The low precision can  make iterative refinement fail because the half precision factorization  can have a large error. Here is an example to illustrate this point.  The matrix here is modestly ill-conditioned and you can see that in the  error from a direct solve in double precision.","category":"page"},{"location":"Details/","page":"More than you want to know","title":"More than you want to know","text":"julia> A=I - 800.0*G;\n\njulia> x=ones(N);\n\njulia> b=A*x;\n\njulia> xd=A\\b;\n\njulia> norm(b-A*xd,Inf)\n6.96332e-13\n\njulia> norm(xd-x,Inf)\n2.30371e-12","category":"page"},{"location":"Details/","page":"More than you want to know","title":"More than you want to know","text":"Now, if we downcast things to half precision, nothing good happens.","category":"page"},{"location":"Details/","page":"More than you want to know","title":"More than you want to know","text":"julia> AH=Float16.(A);\n\njulia> AHF=hlu!(AH);\n\njulia> z=AHF\\b;\n\njulia> norm(b-A*z,Inf)\n6.25650e-01\n\njulia> norm(z-xd,Inf)\n2.34975e-01","category":"page"},{"location":"Details/","page":"More than you want to know","title":"More than you want to know","text":"So you get very poor, but unsurprising, results. While MultiPrecisionArrays.jl supports half precision and I use it all the time, it is not something you would use in your own work without looking at the literature and making certain you are prepared for strange results. Getting good results consistently from half precision is an active research area.","category":"page"},{"location":"functions/MPArray/#MPArray:-constructor","page":"MPArray: constructor","title":"MPArray: constructor","text":"","category":"section"},{"location":"functions/MPArray/","page":"MPArray: constructor","title":"MPArray: constructor","text":"MPArray(AH::Array{Float64,2}; TL = Float32, onthefly=false)\nMPArray(AH::Array{Float32,2}; TL = Float16, onthefly=false)","category":"page"},{"location":"functions/MPArray/#MultiPrecisionArrays.MPArray-Tuple{Matrix{Float64}}","page":"MPArray: constructor","title":"MultiPrecisionArrays.MPArray","text":"MPArray(AH::Array{Float64,2}; TL = Float32, onthefly=false) Default constructor for MPArray. \n\nC. T. Kelley 2023\n\nThe difference between and MPArray and an MPEArray is that  MPEArray does interprecision transfers on the fly. Set onthefly = true and get an MPEArray.\n\nThe MPArray data structure is\n\nstruct MPArray{TH<:AbstractFloat,TL<:AbstractFloat}\n    AH::Array{TH,2}\n    AL::Array{TL,2}\n    residual::Vector{TH}\nend\n\nThe constructor just builds an MPArray with TH=Float64. Set TL=Float16 to get double/half IR.\n\nMPEArray is exactly the same but the triangular solver dispatches differently.\n\n\n\n\n\n","category":"method"},{"location":"functions/MPArray/#MultiPrecisionArrays.MPArray-Tuple{Matrix{Float32}}","page":"MPArray: constructor","title":"MultiPrecisionArrays.MPArray","text":"MPArray(AH::Array{Float32,2}; TL = Float16, onthefly=false) Default single precision constructor for MPArray.\n\nSo if your high precision array is single, then your low precision array is half (Duh!). \n\nData structures etc are the same as in the  double-single/half case, but you don't have the option to go lower than half.\n\n\n\n\n\n","category":"method"},{"location":"functions/mplu!/#mplu!:-Simple-MPArray-factorization","page":"mplu!: Simple MPArray factorization","title":"mplu!: Simple MPArray factorization","text":"","category":"section"},{"location":"functions/mplu!/","page":"mplu!: Simple MPArray factorization","title":"mplu!: Simple MPArray factorization","text":"mplu!(MPA::Union{MPArray,MPEArray})","category":"page"},{"location":"functions/mplu!/#MultiPrecisionArrays.mplu!-Tuple{Union{MPArray, MPEArray}}","page":"mplu!: Simple MPArray factorization","title":"MultiPrecisionArrays.mplu!","text":"mplu!(MPA::Union{MPArray,MPEArray})\n\nPlain vanilla MPArray factorization.\n\nThe story on interprecision transfers is that \n\nMPLFact downcasts the residual before the solve and avoids N^2  interprecision transfers. MPLFact factors MPArrays.\nMPLEFact factors MPEArrays and therefore does interprecision transfers  on the fly and incurs the N^2 interprecision transfer cost for that. \nMPLEFact is what you must use if you plan to use the low precision  factorization as a preconditioner in IR-GMRES or you're working in  Float16 and the matrix is very ill-conditioned. MPLEFact factors  MPEArrays, which know to do interprecision transfers on-the-fly.\n\nThe \n\nUnion{MPArray,MPEArray}\n\nlets me use the on_the_fly trait to figure out what do to.\n\n\n\n\n\n","category":"method"},{"location":"functions/mpgeslir/#mpgeslir:-IR-solver","page":"mpgeslir: IR solver","title":"mpgeslir: IR solver","text":"","category":"section"},{"location":"functions/mpgeslir/","page":"mpgeslir: IR solver","title":"mpgeslir: IR solver","text":"mpgeslir(AF::MPFact, b; reporting=false, verbose=true)\nmpgeslir(AF::MPAArray, b; reporting=false, verbose=true)","category":"page"},{"location":"functions/mpgeslir/#MultiPrecisionArrays.mpgeslir-Tuple{Union{MPHFact, MPLEFact, MPLFact}, Any}","page":"mpgeslir: IR solver","title":"MultiPrecisionArrays.mpgeslir","text":"mpgeslir(AF::MPFact, b; reporting=false, verbose=true)\n\nUse a multi-precision factorization to solve a linear system with plain vanilla iterative refinement.\n\nMPFact is a union of all the MultiPrecision factorizations in the package.  The triangular solver will dispatch on the various types depending on how the interprecision transfers get done.\n\n\n\n\n\n","category":"method"},{"location":"functions/mpgeslir/#MultiPrecisionArrays.mpgeslir-Tuple{Union{MPArray, MPEArray}, Any}","page":"mpgeslir: IR solver","title":"MultiPrecisionArrays.mpgeslir","text":"mpgeslir(MPA::MPAArray, b; reporting = false, verbose = true)\n\nUse a multi-precision factorization to solve a linear system with plain vanilla iterative refinement.\n\nThis version is analogous to A\b and combines the factorization and the solve. You start with MPA=MPArray(A) and then pass MPA to mpgeslA\b and combines the factorization and the solve. \n\nUnlike lu, this does overwrite the low precision part of MPA. I use this to get some timing results  and it's also convenient if you want to do factor and solve in one statement. \n\n\n\n\n\n","category":"method"},{"location":"#MultiPrecisionArrays.jl-v0.0.5","page":"Home","title":"MultiPrecisionArrays.jl v0.0.5","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"C. T. Kelley","category":"page"},{"location":"","page":"Home","title":"Home","text":"MultiPrecisionArrays.jl is a package for iterative refinement. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"This package provides data structures and solvers for several variants of iterative refinement. It will become much more useful when half precision (aka Float16) is fully supported in LAPACK/BLAS. For now, it's only general-purpose application is classical iterative refinement with double precision equations and single precision factorizations.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The half precision stuff is good for those of us doing research in this field. Half precision performance has progressed to the point where you can actually get things done. On an Apple M2-Pro, a half precision LU only costs 3–5 times what a double precision LU costs. This may be as good as it gets unless someone wants to duplicate the LAPACK implementation and get the benefits from blocking, recursion, and clever cache management.","category":"page"},{"location":"","page":"Home","title":"Home","text":"We use a hack-job LU factorization for half precision. Look at the source for hlu!.jl.","category":"page"},{"location":"#What-is-iterative-refinement.","page":"Home","title":"What is iterative refinement.","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The idea is to solve Ax=b in high precision using a factorization in lower precision. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"IR(A, b)","category":"page"},{"location":"","page":"Home","title":"Home","text":"Initialize: x = 0,  r = b\nFactor A = LU in a lower precision\nWhile  r  is too large\nCompute the defect d = (LU)^-1 r\nCorrect the solution x = x + d\nUpdate the residual r = b - Ax\nend","category":"page"},{"location":"","page":"Home","title":"Home","text":"In Julia, a code to do this would solve the linear system A x = b in double precision by using a factorization in a lower precision, say single, within a residual correction iteration. This means that one would need to allocate storage for a copy of A is the lower precision and factor that copy. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"Then one has to determine what the line d = (LU)^-1 r means. Do you cast r into the lower precision before the solve or not? MultiPrecisionArrays.jl provides data structures and solvers to manage this. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"Here's a simple Julia function for IR that","category":"page"},{"location":"","page":"Home","title":"Home","text":"\"\"\"\nIR(A,b)\nSimple minded iterative refinement\nSolve Ax=b\n\"\"\"\nfunction IR(A, b)\n    x = zeros(length(b))\n    r = copy(b)\n    tol = 100.0 * eps(Float64)\n    #\n    # Allocate a single precision copy of A and factor in place\n    #\n    A32 = Float32.(A)\n    AF = lu!(A32)\n    #\n    # Give IR at most ten iterations, which it should not need\n    # in this case\n    #\n    itcount = 0\n    # The while loop will get more attention later.\n    while (norm(r) > tol * norm(b)) && (itcount < 10)\n        #\n        # Store r and d = AF\\r in the same place.\n        #\n        ldiv!(AF, r)\n        x .+= r\n        r .= b - A * x\n        itcount += 1\n    end\n    return x\nend","category":"page"},{"location":"","page":"Home","title":"Home","text":"The MPArray structure contains both A, the low precision copy, and a vector for the residual.  This lets you allocate the data in advance an reuse the structure for other right hand sides without rebuilding (or refactoring!) the low precision copy. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"As written in the function, the defect uses ldiv! to compute AF\\r. This means that the two triangular factors are stored in single precision and interprecision transfers are done with each step in the factorization. While that on the fly interprecision  transfer is an option, and is needed in many situations, the default is to downcast r to low precision, do the solve entirely in low precision, and the upcast the result. The code for that looks like","category":"page"},{"location":"","page":"Home","title":"Home","text":"normr=norm(r)\nds=Float32.(r)/normr\nldiv!(AF, ds)\nr .= Float64.(ds)*normr","category":"page"},{"location":"","page":"Home","title":"Home","text":"The scaling by 1.0/normr avoids underflow, which is most important when the low precision is Float16. We will discuss interprecision  transfer costs later.","category":"page"},{"location":"#Integral-Equations-Example","page":"Home","title":"Integral Equations Example","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The submodule MultiPrecisionArrays.Examples has an example which we will  use for most of the documentation. The function Gmat(N) returns the trapeziod rule discretization of the Greens operator  for -d^2dx^2 on 01","category":"page"},{"location":"","page":"Home","title":"Home","text":"G u(x) = int_0^1 g(xy) u(y)  dy ","category":"page"},{"location":"","page":"Home","title":"Home","text":"where","category":"page"},{"location":"","page":"Home","title":"Home","text":"g(xy) = \n    leftbeginarrayc\n        y (1-x)   x  y\n        x (1-y)   x le y\n    endarrayright","category":"page"},{"location":"","page":"Home","title":"Home","text":"The eigenvalues of G are 1(n^2 pi^2) for n = 1 2 dots.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The code for this is in the /src/Examples directory.  The file is Gmat.jl.","category":"page"},{"location":"","page":"Home","title":"Home","text":"In the example we will build a matrix A = I - alpha G. In the examples we will use alpha=10, a very well conditioned case, and alpha=8000 This latter case is very near singularity.","category":"page"},{"location":"","page":"Home","title":"Home","text":"We will solve a linear system with both double precision LU and an MPArray and compare execution time and the quality of the results. The problem setup is pretty simple","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> using MultiPrecisionArrays\n\njulia> using BenchmarkTools\n\njulia> using MultiPrecisionArrays.Examples\n\njulia> N=4096; G=Gmat(N); A=I - G; x=ones(N); b=A*x;\n\njulia> @belapsed lu!(AC) setup=(AC=copy($A))\n1.43148e-01","category":"page"},{"location":"","page":"Home","title":"Home","text":"At this point we have timed lu!. The next step is to construct an MPArray and factor the low precision matrix. We use the constructor MPArray to store A, the low precision copy and the residual. The we apply the function mplu! to factor the low precision copy in place.","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> MPA=MPArray(A);\n\njulia> @belapsed mplu!(MPAC) setup=(MPAC=deepcopy($MPA))\n8.02158e-02","category":"page"},{"location":"","page":"Home","title":"Home","text":"So the single precision factorization is roughly half the cost of the double precision one. Now for the solves. Both lu! and mplu! produce a factorization object and \\ works with both. You have to be a bit careful because MPA and A share storage. So I will use lu instead of lu! when factoring A.","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> AF=lu(A); xf = AF\\b;\n\njulia> MPAF=mplu!(MPA); xmp=MPAF\\b;\n\njulia> println(norm(xf-x,Inf),\"  \",norm(xmp-x,Inf))\n7.41629e-14  8.88178e-16","category":"page"},{"location":"","page":"Home","title":"Home","text":"You can see that the solutions are equally good.","category":"page"},{"location":"functions/hlu!/#hlu!:-Get-LU-to-perform-reasonably-well-for-Float16","page":"hlu!: Get LU to perform reasonably well for Float16","title":"hlu!: Get LU to perform reasonably well for Float16","text":"","category":"section"},{"location":"functions/hlu!/","page":"hlu!: Get LU to perform reasonably well for Float16","title":"hlu!: Get LU to perform reasonably well for Float16","text":"hlu!(A::Matrix{T}) where{T}","category":"page"},{"location":"functions/hlu!/#MultiPrecisionArrays.hlu!-Union{Tuple{Matrix{T}}, Tuple{T}} where T","page":"hlu!: Get LU to perform reasonably well for Float16","title":"MultiPrecisionArrays.hlu!","text":"hlu!(A::Matrix{T}; minbatch=16) where {T} Return LU factorization of A\n\nC. T. Kelley, 2023\n\nThis function is a hack of generic_lufact! which is part of\n\nhttps://github.com/JuliaLang/julia/blob/master/stdlib/LinearAlgebra/src/lu.jl\n\nI \"fixed\" the code to be Float16 only and fixed pivoting to only MaxRow.\n\nAll I did in the factorization was thread the critical loop with Polyester.@batch and put @simd in the inner loop. These changes got me a 10x speedup on my Mac M2 Pro with 8 performance cores. I'm happy.\n\nI set Polyester's minbatch to 16, which worked best for me. YMMV\n\n\n\n\n\n","category":"method"}]
}
