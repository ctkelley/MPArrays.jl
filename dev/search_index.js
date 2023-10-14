var documenterSearchIndex = {"docs":
[{"location":"functions/hlu!/#hlu!:-Get-LU-to-perform-reasonably-well-for-Float16","page":"hlu!: Get LU to perform reasonably well for Float16","title":"hlu!: Get LU to perform reasonably well for Float16","text":"","category":"section"},{"location":"functions/hlu!/","page":"hlu!: Get LU to perform reasonably well for Float16","title":"hlu!: Get LU to perform reasonably well for Float16","text":"hlu!(A::Matrix{T}) where{T}","category":"page"},{"location":"functions/hlu!/#MultiPrecisionArrays.hlu!-Union{Tuple{Matrix{T}}, Tuple{T}} where T","page":"hlu!: Get LU to perform reasonably well for Float16","title":"MultiPrecisionArrays.hlu!","text":"hlu!(A::Matrix{T}; minbatch=16) where {T} Return LU factorization of A\n\nC. T. Kelley, 2023\n\nThis function is a hack of generic_lufact! which is part of\n\nhttps://github.com/JuliaLang/julia/blob/master/stdlib/LinearAlgebra/src/lu.jl\n\nI \"fixed\" the code to be Float16 only and fixed pivoting to only MaxRow.\n\nAll I did in the factorization was thread the critical loop with Polyester.@batch and put @simd in the inner loop. These changes got me a 10x speedup on my Mac M2 Pro with 8 performance cores. I'm happy.\n\nI set Polyester's minbatch to 16, which worked best for me. YMMV\n\n\n\n\n\n","category":"method"},{"location":"functions/mpgmir/#mpgmir:-GMRES-IR-solver","page":"mpgmir: GMRES-IR solver","title":"mpgmir: GMRES-IR solver","text":"","category":"section"},{"location":"functions/mpgmir/","page":"mpgmir: GMRES-IR solver","title":"mpgmir: GMRES-IR solver","text":"mpgmir(AF::MPGFact, b; reporting = false, verbose = false, mpdebug = false)","category":"page"},{"location":"functions/mpgmir/#MultiPrecisionArrays.mpgmir-Tuple{Union{MultiPrecisionArrays.MPGEFact, MPGHFact}, Any}","page":"mpgmir: GMRES-IR solver","title":"MultiPrecisionArrays.mpgmir","text":"mpgmir(AF::MPGFact, b; reporting=false, verbose=false, mpdebug=false)\n\nGMRES-IR solver \n\n\n\n\n\n","category":"method"},{"location":"Half_1/#Half-Precision-and-GMRES-IR","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"","category":"section"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"Using half precision will not speed anything up, in fact it will make  the solver slower. The reason for this is that LAPACK and the BLAS  do not (YET) support half precision, so all the clever stuff in there is missing. We provide a half precision LU factorization /src/Factorizations/hlu!.jl that is better than nothing.  It's a hack of Julia's  generic_lu! with threading and a couple compiler directives. Even so, it's 2.5 – 5 x slower than a  double precision LU. Half precision support is coming  (Julia and Apple support it in hardware!) but for now, at least for desktop computing, half precision is for research in iterative refinement, not applications. ","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"Here's a table (created with  /CodeForDocs/HalfTime.jl ) that illustrates the point. In the table we compare timings for LAPACK's LU to the LU we compute with hlu!.jl. The matrix is  I-8000*G.","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"      N       F64       F32       F16     F16/F64 \n     1024  3.65e-03  2.65e-03  5.26e-03  1.44e+00 \n     2048  2.26e-02  1.41e-02  3.70e-02  1.64e+00 \n     4096  1.55e-01  8.53e-02  2.55e-01  1.65e+00 \n     8192  1.15e+00  6.05e-01  4.23e+00  3.69e+00 ","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"The columns of the table are the dimension of the problem, timings for double, single, and half precision, and the ratio of the half precision timings to double. The timings came from Julia 1.10-beta2 running on an Apple M2 Pro with 8 performance cores.","category":"page"},{"location":"Half_1/#Half-Precision-is-Subtle","page":"Half Precision and GMRES-IR","title":"Half Precision is Subtle","text":"","category":"section"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"Half precision is also difficult to use properly. The low precision can  make iterative refinement fail because the half precision factorization  can have a large error. Here is an example to illustrate this point.  The matrix here is modestly ill-conditioned and you can see that in the  error from a direct solve in double precision.","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"julia> A=I - 800.0*G;\n\njulia> x=ones(N);\n\njulia> b=A*x;\n\njulia> xd=A\\b;\n\njulia> norm(b-A*xd,Inf)\n6.96332e-13\n\njulia> norm(xd-x,Inf)\n2.30371e-12","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"Now, if we downcast things to half precision, nothing good happens.","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"julia> AH=Float16.(A);\n\njulia> AHF=hlu!(AH);\n\njulia> z=AHF\\b;\n\njulia> norm(b-A*z,Inf)\n6.25650e-01\n\njulia> norm(z-xd,Inf)\n2.34975e-01","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"So you get very poor, but unsurprising, results. While MultiPrecisionArrays.jl supports half precision and I use it all the time, it is not something you would use in your own work without looking at the literature and making certain you are prepared for strange results. Getting good results consistently from half precision is an active research area.","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"So, it should not be a surprise that IR also struggles with half precision. We will illustrate this with one simple example. In this example high precision will be single and low will be half. Using {\\bf MPArray} with a single precision matrix will automatically make the low precision matrix half precision.","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"julia> N=4096; G=800.0*Gmat(N); A=I - Float32.(G);\n\njulia> x=ones(Float32,N); b=A*x;\n\njulia> MPA=MPArray(A); MPF=mplu!(MPA; onthefly=false);\n\njulia> y=MPF\\b;\n\njulia> norm(b - A*y,Inf)\n1.05272e+02","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"So, IR completely failed for this example. We will show how to extract the details of the iteration in a later section.","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"It is also worthwhile to see if doing the triangular solves on-the-fly (MPS) helps.","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"julia> MPB=MPArray(A; onthefly=true); MPBF=mplu!(MPB);\n\njulia> z=MPBF\\b;\n\njulia> norm(b-A*z,Inf)\n1.28174e-03","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"So, MPS is better in the half precision case. Moreover, it is also less costly thanks to the limited support for half precision computing. For that reason, MPS is the default when high precision is single.","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"However, on-the-fly solves are not enough to get good results and IR still terminates too soon.","category":"page"},{"location":"Half_1/#GMRES-IR","page":"Half Precision and GMRES-IR","title":"GMRES-IR","text":"","category":"section"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"GMRES-IR solves the correction equation with a preconditioned GMRES iteration. One way to think of this is that the solve in the IR loop is an approximate solver for the correction equation","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"A d = r","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"where one replaces A with the low precision factors ml mU. In GMRES-IR one solves the correction equation with a left-preconditioned GMRES iteration using U^-1 L^-1 as the preconditioner. The preconditioned equation is","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"U^-1 L^-1  A d = U^-1 L^-1 r","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"GMRES-IR will not be as efficient as IR because each iteration is itself an GMRES iteration and application of the preconditioned matrix-vector product has the same cost (solve + high precision matrix vector product) as a single IR iteration. However, if low precision is half, this approach can recover the residual norm one would get from a successful IR iteration.","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"There is also a storage problem. One should allocate storage for the Krylov basis vectors and other vectors that GMRES needs internally. We do that in the factorization phase. So the structure {\\bf MPGEFact} has the  factorization of the low precision matrix, the residual, the Krylov basis and some other vectors needed in the solve. ","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"Here is a well conditioned example. Both IR and GMRES-IR perform well, with GMRES-IR taking significantly more time.  Note that I cannot use the same multiprecision array for both factorizations because the data for the low precision factorization would be overwritten. So I use the  {\\bf deepcopy} command from Julia {\\bf before} factoring either multiprecision array.","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"julia> using MultiPrecisionArrays\n\njulia> using MultiPrecisionArrays.Examples\n\njulia> using BenchmarkTools\n\njulia> N=4069; AD= I - Gmat(N); A=Float32.(AD); x=ones(Float32,N); b=A*x;\n\njulia> MPA=MPArray(A); MPA2=deepcopy(MPA); \n\njulia> MPF=mplu!(MPA); MPF2=mpglu!(MPA2);\n\njulia> # build two MPArrays and factor them for IR or GMRES-IR\n\njulia> z=MPF\\b; y=MPF2\\b; println(norm(z-x,Inf),\"  \",norm(y-x,Inf))\n5.9604645e-7  2.9802322e-7\n\njulia> @btime $MPF\\$b;\n  13.582 ms (4 allocations: 24.33 KiB)\n\njulia> @btime $MPF2\\$b;\n  52.020 ms (223 allocations: 92.84 KiB)","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"If you dig into the iterations statistics (more on that later) you will see that the GMRES-IR iteration took almost exactly four times as many solves and residual computations as the simple IR solve.","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"We will repeat this experiment on the ill-conditioned example. In this example, as we saw earlier, IR fails to converge.","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"julia> N=4069; AD= I - 800.0*Gmat(N); A=Float32.(AD); x=ones(Float32,N); b=A*x;\n        \njulia> MPA=MPArray(A); MPA2=deepcopy(MPA);\n\njulia> MPF=mplu!(MPA); MPF2=mpglu!(MPA2);\n\njulia> z=MPF\\b; y=MPF2\\b; println(norm(z-x,Inf),\"  \",norm(y-x,Inf))\n0.2875508  0.004160166\n\njulia> println(norm(b-A*z,Inf)/norm(b,Inf),\"  \",norm(b-A*y,Inf)/norm(b,Inf))\n0.0012593127  7.937655e-6","category":"page"},{"location":"Half_1/","page":"Half Precision and GMRES-IR","title":"Half Precision and GMRES-IR","text":"So, the relative error and relative residual norm for GMRES-IR is much smaller than that for IR.","category":"page"},{"location":"functions/MPArray/#MPArray:-constructor","page":"MPArray: constructor","title":"MPArray: constructor","text":"","category":"section"},{"location":"functions/MPArray/","page":"MPArray: constructor","title":"MPArray: constructor","text":"MPArray(AH::Array{Float64,2}; TL = Float32, onthefly=false)\nMPArray(AH::Array{Float32,2}; TL = Float16, onthefly=false)","category":"page"},{"location":"functions/MPArray/#MultiPrecisionArrays.MPArray-Tuple{Matrix{Float64}}","page":"MPArray: constructor","title":"MultiPrecisionArrays.MPArray","text":"MPArray(AH::Array{Float64,2}; TL = Float32, onthefly=false) Default constructor for MPArray. \n\nC. T. Kelley 2023\n\nThe MPArray data structure is\n\nstruct MPArray{TH<:AbstractFloat,TL<:AbstractFloat}\n    AH::Array{TH,2}\n    AL::Array{TL,2}\n    residual::Vector{TH}\n    onthefly::Bool\nend\n\nThe constructor just builds an MPArray with TH=Float64. Set TL=Float16 to get double/half IR.\n\n\n\n\n\n","category":"method"},{"location":"functions/MPArray/#MultiPrecisionArrays.MPArray-Tuple{Matrix{Float32}}","page":"MPArray: constructor","title":"MultiPrecisionArrays.MPArray","text":"MPArray(AH::Array{Float32,2}; TL = Float16, onthefly=true) Default single precision constructor for MPArray. \n\nIf your high precision array is single, then your low precision array is half (Duh!). \n\nWe do the triangular solves with on-the-fly interprecision transfer in this case because the bit of extra accuracy makes a difference and, at least for now, on-the-fly interprecision transfers are cheaper.\n\nData structures etc are the same as in the  double-single/half case, but you don't have the option to go lower than half.\n\n\n\n\n\n","category":"method"},{"location":"functions/mplu!/#mplu!:-Simple-MPArray-factorization","page":"mplu!: Simple MPArray factorization","title":"mplu!: Simple MPArray factorization","text":"","category":"section"},{"location":"functions/mplu!/","page":"mplu!: Simple MPArray factorization","title":"mplu!: Simple MPArray factorization","text":"mplu!(MPA::MPArray)","category":"page"},{"location":"functions/mplu!/#MultiPrecisionArrays.mplu!-Tuple{MPArray}","page":"mplu!: Simple MPArray factorization","title":"MultiPrecisionArrays.mplu!","text":"mplu!(MPA::MPArray)\n\nPlain vanilla MPArray factorization.\n\nThe story on interprecision transfers is that \n\nMPLFact downcasts the residual before the solve and avoids N^2  interprecision transfers. MPLFact factors MPArrays.\nMPLEFact factors MPEArrays and therefore does interprecision transfers  on the fly and incurs the N^2 interprecision transfer cost for that. \nMPLEFact is what you must use if you plan to use the low precision  factorization as a preconditioner in IR-GMRES or you're working in  Float16 and the matrix is very ill-conditioned. MPLEFact factors  MPEArrays, which know to do interprecision transfers on-the-fly.\n\nThe \n\nUnion{MPArray,MPEArray}\n\nlets me use the on_the_fly trait to figure out what do to.\n\n\n\n\n\n","category":"method"},{"location":"Details/Interprecision_1/#Interprecision-Transfers:-Part-I","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"","category":"section"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"The discussion in this section is for the most useful case where high precision is Float64 and low precision is Float32. Things are different if low precision is Float16.","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"Recall that the default way to use the low precision factorization  is to copy r into low precision, scale it, perform the solve in  low precision, and then reverse the scaling and promote the  correction d. So if AF = lu(A32) is  the factorization object for the low precision factorization, then we compute d via","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"d = norm(r)* Float64.( AF\\ (Float32.(r / norm(r))))","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"We will refer to this approach as the low precision solve (LPS).  As we said earlier, if one simply does","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"d = AF\\r","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"the elements of the triangular matrices are promoted to double as the solves take place. We will refer to this as a mixed precision solve (MPS). In the table below we report timings from Julia's  BenchmarkTools package for double precision matrix vector multiply (MV64), single precision LU factorization (LU32) and three approaches for using the factors to solve a linear system. HPS is the time for a fully double precision triangular solved and MPS and LPS are the mixed precision solve and the fully low precision solve. IR will use a high precision matrix vector multiply to compute the residual and a solve to compute the correction for each iteration. The low precision factorization is done only once.","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"In this example A = I + 800 G(N) and we look at several values of N.","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"    N      MV64       LU32       HPS        MPS        LPS   LU32/MPS\n  512    2.8e-05    7.7e-04    5.0e-05    1.0e-04    2.8e-05 7.8e+00\n 1024    1.1e-04    2.6e-03    1.9e-04    7.7e-04    1.0e-04 3.4e+00\n 2048    6.1e-04    1.4e-02    8.8e-04    3.5e-03    4.0e-04 4.0e+00\n 4096    1.9e-03    8.4e-02    4.7e-03    1.4e-02    2.2e-03 5.8e+00\n 8192    6.9e-03    5.9e-01    1.9e-02    5.9e-02    9.7e-03 9.9e+00","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"The last column of the table is the ratio of timings for the low precision factorization and the mixed precision solve. Keeping in mind that at least two solves will be needed in IR, the table shows that MPS can be a significant fraction of the cost of the solve for smaller problems and that LPS is at least 4 times less costly. This is a compelling case for using LPS in case considered in this section, where high precision is double and low precision is single, provided the performance of IR is equally good.","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"If one is solving ma vx = vb for multiple right hand sides, as one would do for nonlinear equations in many cases, then LPS is significantly faster for small and moderately large problems. For example, for N=4096 the cost of MPS is roughly 15 of the low precision LU factorization, so if one does more than 6 solves with the same factorization, the solve cost would be more than the factorization cost. LPS is five times faster and we saw this effect while preparing our our nonlinear solver package SIAMFANL.jl. The situation for IR is similar, but one must consider the cost of the high precision matrix-vector multiply, which is about the same as LPS.","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"We make LPS the default for IR if high precision is double and low precision is single. This decision is good for desktop computing. If low precision is half, then the LPS vs MPS decision needs more scrutiny.","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"Since MPS does the triangular solves in high precision, one should expect that the results will be more accurate and that the improved accuracy might enable the IR loop to terminate earlier \\cite{CarsonHigham}. We should be able to see that by timing the IR loop after computing the factorization. One should also verify that the residual norms are equally good.","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"We will conclude this section with two final tables for the results of IR with A = I + alpha G(N). We compare the well conditioned case (alpha=1) and the ill-conditioned case (alpha=800) for a few values of N. We will look at residual and error norms for both approaches to interprecision transfer. The conclusion is that if high precision is double and low is single, the two approaches give equally good results. ","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"The columns of the tables are the dimensions, the ell^infty relative error norms for both LP and MP interprecision transfers (ELP and EMP) and the corresponding relative residual norms (RLP and RMP).","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"The results for alpha=1 took 5 IR iterations for all cases. As expected the LPS iteration was faster than MPS. However, for the ill-conditioned alpha=800 case, MPS took one fewer iteration (5 vs 6) than EPS for all but the smallest problem. Even so, the overall solve times were essentially the same.","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"alpha=1","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"    N      ELP        EMP        RLP         RMP        TLP       TMP \n  512    4.4e-16    5.6e-16    3.9e-16    3.9e-16    2.8e-04   3.6e-04 \n 1024    6.7e-16    4.4e-16    3.9e-16    3.9e-16    1.2e-03   1.5e-03 \n 2048    5.6e-16    4.4e-16    3.9e-16    3.9e-16    5.8e-03   6.2e-03 \n 4096    1.1e-15    1.1e-15    7.9e-16    7.9e-16    1.9e-02   2.4e-02 \n 8192    8.9e-16    6.7e-16    7.9e-16    5.9e-16    7.0e-02   8.9e-02 ","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"alpha=800","category":"page"},{"location":"Details/Interprecision_1/","page":"Interprecision Transfers: Part I","title":"Interprecision Transfers: Part I","text":"    N      ELP        EMP        RLP         RMP        TLP       TMP \n  512    6.3e-13    6.2e-13    2.1e-15    1.8e-15    3.3e-04   3.8e-04 \n 1024    9.6e-13    1.1e-12    3.4e-15    4.8e-15    1.3e-03   1.4e-03 \n 2048    1.0e-12    1.2e-12    5.1e-15    4.5e-15    7.2e-03   6.8e-03 \n 4096    2.1e-12    2.1e-12    6.6e-15    7.5e-15    2.4e-02   2.5e-02 \n 8192    3.3e-12    3.2e-12    9.0e-15    1.0e-14    8.4e-02   8.9e-02 ","category":"page"},{"location":"functions/mpgeslir/#mpgeslir:-IR-solver","page":"mpgeslir: IR solver","title":"mpgeslir: IR solver","text":"","category":"section"},{"location":"functions/mpgeslir/","page":"mpgeslir: IR solver","title":"mpgeslir: IR solver","text":"mpgeslir(AF::MPFact, b; reporting=false, verbose=true)\nmpgeslir(AF::MPArray, b; reporting=false, verbose=true)","category":"page"},{"location":"functions/mpgeslir/#MultiPrecisionArrays.mpgeslir-Tuple{Union{MPHFact, MPLFact}, Any}","page":"mpgeslir: IR solver","title":"MultiPrecisionArrays.mpgeslir","text":"mpgeslir(AF::MPFact, b; reporting=false, verbose=true)\n\nUse a multi-precision factorization to solve a linear system with plain vanilla iterative refinement.\n\nMPFact is a union of all the MultiPrecision factorizations in the package.  The triangular solver will dispatch on the various types depending on how the interprecision transfers get done.\n\n\n\n\n\n","category":"method"},{"location":"functions/mpgeslir/#MultiPrecisionArrays.mpgeslir-Tuple{MPArray, Any}","page":"mpgeslir: IR solver","title":"MultiPrecisionArrays.mpgeslir","text":"mpgeslir(MPA::MPArray, b; reporting = false, verbose = true)\n\nUse a multi-precision factorization to solve a linear system with plain vanilla iterative refinement.\n\nThis version is analogous to A\\b and combines the factorization and the solve. You start with MPA=MPArray(A) and then pass MPA to mpgeslir and combine the factorization and the solve. \n\nUnlike lu, this does overwrite the low precision part of MPA. I use this to get some timing results and it's also convenient if you want to do factor and solve in one statement. \n\n\n\n\n\n","category":"method"},{"location":"#MultiPrecisionArrays.jl-v0.0.6","page":"Home","title":"MultiPrecisionArrays.jl v0.0.6","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"C. T. Kelley","category":"page"},{"location":"","page":"Home","title":"Home","text":"MultiPrecisionArrays.jl is a package for iterative refinement. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"This package provides data structures and solvers for several variants of iterative refinement. It will become much more useful when half precision (aka Float16) is fully supported in LAPACK/BLAS. For now, it's only general-purpose application is classical iterative refinement with double precision equations and single precision factorizations.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The half precision stuff is good for those of us doing research in this field. Half precision performance has progressed to the point where you can actually get things done. On an Apple M2-Pro, a half precision LU only costs 3–5 times what a double precision LU costs. This may be as good as it gets unless someone wants to duplicate the LAPACK implementation and get the benefits from blocking, recursion, and clever cache management.","category":"page"},{"location":"","page":"Home","title":"Home","text":"We use a hack-job LU factorization for half precision. Look at the source for hlu!.jl.","category":"page"},{"location":"#What-is-iterative-refinement.","page":"Home","title":"What is iterative refinement.","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The idea is to solve Ax=b in high precision using a factorization in lower precision. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"IR(A, b)","category":"page"},{"location":"","page":"Home","title":"Home","text":"Initialize: x = 0,  r = b\nFactor A = LU in a lower precision\nWhile  r  is too large\nCompute the defect d = (LU)^-1 r\nCorrect the solution x = x + d\nUpdate the residual r = b - Ax\nend","category":"page"},{"location":"","page":"Home","title":"Home","text":"In Julia, a code to do this would solve the linear system A x = b in double precision by using a factorization in a lower precision, say single, within a residual correction iteration. This means that one would need to allocate storage for a copy of A is the lower precision and factor that copy. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"Then one has to determine what the line d = (LU)^-1 r means. Do you cast r into the lower precision before the solve or not? MultiPrecisionArrays.jl provides data structures and solvers to manage this. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"Here's a simple Julia function for IR that","category":"page"},{"location":"","page":"Home","title":"Home","text":"\"\"\"\nIR(A,b)\nSimple minded iterative refinement\nSolve Ax=b\n\"\"\"\nfunction IR(A, b)\n    x = zeros(length(b))\n    r = copy(b)\n    tol = 100.0 * eps(Float64)\n    #\n    # Allocate a single precision copy of A and factor in place\n    #\n    A32 = Float32.(A)\n    AF = lu!(A32)\n    #\n    # Give IR at most ten iterations, which it should not need\n    # in this case\n    #\n    itcount = 0\n    # The while loop will get more attention later.\n    while (norm(r) > tol * norm(b)) && (itcount < 10)\n        #\n        # Store r and d = AF\\r in the same place.\n        #\n        ldiv!(AF, r)\n        x .+= r\n        r .= b - A * x\n        itcount += 1\n    end\n    return x\nend","category":"page"},{"location":"","page":"Home","title":"Home","text":"The MPArray structure contains both A, the low precision copy, and a vector for the residual.  This lets you allocate the data in advance and reuse the structure for other right hand sides without rebuilding (or refactoring!) the low precision copy. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"As written in the function, the defect uses ldiv! to compute AF\\r. This means that the two triangular factors are stored in single precision and interprecision transfers are done with each step in the factorization. While that on the fly interprecision  transfer is an option, and is needed in many situations, the default is to downcast r to low precision, do the solve entirely in low precision, and the upcast the result. The code for that looks like","category":"page"},{"location":"","page":"Home","title":"Home","text":"normr=norm(r)\nds=Float32.(r)/normr\nldiv!(AF, ds)\nr .= Float64.(ds)*normr","category":"page"},{"location":"","page":"Home","title":"Home","text":"The scaling by 1.0/normr avoids underflow, which is most important when the low precision is Float16. We will discuss interprecision  transfer costs later.","category":"page"},{"location":"#Integral-Equations-Example","page":"Home","title":"Integral Equations Example","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The submodule MultiPrecisionArrays.Examples has an example which we will  use for most of the documentation. The function Gmat(N) returns the trapeziod rule discretization of the Greens operator  for -d^2dx^2 on 01 with homogeneous Dirichlet boundary conditions.","category":"page"},{"location":"","page":"Home","title":"Home","text":"G u(x) = int_0^1 g(xy) u(y)  dy ","category":"page"},{"location":"","page":"Home","title":"Home","text":"where","category":"page"},{"location":"","page":"Home","title":"Home","text":"g(xy) = \n    leftbeginarrayc\n        y (1-x)   x  y\n        x (1-y)   x le y\n    endarrayright","category":"page"},{"location":"","page":"Home","title":"Home","text":"The eigenvalues of G are 1(n^2 pi^2) for n = 1 2 dots.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The code for this is in the /src/Examples directory.  The file is Gmat.jl.","category":"page"},{"location":"","page":"Home","title":"Home","text":"In the example we will build a matrix A = I - alpha G. In the examples we will use alpha=10, a very well conditioned case, and alpha=8000 This latter case is very near singularity.","category":"page"},{"location":"","page":"Home","title":"Home","text":"We will solve a linear system with both double precision LU and an MPArray and compare execution time and the quality of the results.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The example below compares the cost of a double precision factorization to a MPArray factorization. The MPArray structure has a high precision and a low precision matrix. The structure we will start with  is","category":"page"},{"location":"","page":"Home","title":"Home","text":"struct MPArray{TH<:AbstractFloat,TL<:AbstractFloat}\n    AH::Array{TH,2}\n    AL::Array{TL,2}\n    residual::Vector{TH}\n    onthefly::Bool\nend","category":"page"},{"location":"","page":"Home","title":"Home","text":"The structure also stores the residual. The onthefly Boolean tells the solver how to do the interprecision transfers. The easy way to get started is to use the mplu  command directly on the matrix. That will build the MPArray, follow that with the factorization, and put in all in a structure that you can use with \\.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Now we will see how the results look. In this example we compare the result with iterative refinement with A\\b, which is LAPACK's LU.  As you can see the results are equally good. Note that the factorization object MPF is the output of mplu. This is analogous to AF=lu(A) in LAPACK.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Now we will see how the results look. In this example we compare the result with iterative refinement with A\\b, which is LAPACK's LU.  As you can see the results are equally good. Note that the factorization object MPF is the output of mplu. This is analogous to AF=lu(A) in LAPACK.","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> using MultiPrecisionArrays\n\njulia> using MultiPrecisionArrays.Examples\n\njulia> using BenchmarkTools\n\njulia> N=4096;\n\njulia> G=Gmat(N);\n\njulia> A = I - G;\n\njulia> MPF=mplu(A); AF=lu(A);\n\njulia> z=MPF\\b; w=AF\\b;\n\njulia> ze=norm(z-x,Inf); zr=norm(b-A*z,Inf)/norm(b,Inf);\n\njulia> we=norm(w-x,Inf); wr=norm(b-A*w,Inf)/norm(b,Inf);\n\njulia> println(\"Errors: $ze, $we. Residuals: $zr, $wr\")\nErrors: 8.88178e-16, 7.41629e-14. Residuals: 1.33243e-15, 7.40609e-14\n","category":"page"},{"location":"","page":"Home","title":"Home","text":"So the resuts are equally good.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The compute time for mplu should be half that of lu.","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> @belapsed mplu($A)\n8.55328e-02\n\njulia> @belapsed lu($A)\n1.49645e-01\n","category":"page"},{"location":"","page":"Home","title":"Home","text":"So the single precision factorization is roughly half the cost of the double precision one. Now for the solves. Both lu and mplu produce a factorization object and \\ works with both.","category":"page"},{"location":"#A-few-subtleties-in-the-example","page":"Home","title":"A few subtleties in the example","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Here is the source for mplu","category":"page"},{"location":"","page":"Home","title":"Home","text":"\"\"\"\nmplu(A::Array{Float64,2}; TL=Float32, onthefly=false)\n\nCombines the constructor of the multiprecision array with the\nfactorization.\n\"\"\"\nfunction mplu(A::Array{TH,2}; TL=Float32, onthefly=nothing) where TH <: Real\n#\n# If the high precision matrix is single, the low precision must be half.\n#\n(TH == Float32) && (TL = Float16)\n#\n# Unless you tell me otherwise, onthefly is true if low precision is half\n# and false if low precision is single.\n#\n(onthefly == nothing ) && (onthefly = (TL==Float16))\nMPA=MPArray(A; TL=TL, onthefly=onthefly)\nMPF=mplu!(MPA)\nreturn MPF\nend","category":"page"},{"location":"","page":"Home","title":"Home","text":"The function mplu has two keyword arguments. The easy one to understand is TL which is the precision of the factoriztion. Julia has support for single (Float32) and half (Float16) precisions. If you set TL=Float16 then low precision will be half. Don't do that unless you know what you're doing. Using half precision is a fast way to get incorrect results. Look at the section on half precision in this Readme for a bit more bad news.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The other keyword arguemnt is onthefly. That keyword controls how the triangular solvers from the factorization work. When you solve","category":"page"},{"location":"","page":"Home","title":"Home","text":"LU d = r","category":"page"},{"location":"","page":"Home","title":"Home","text":"The LU factors are in low precision and the residual r is in high precision. If you let Julia and LAPACK figure out what to do, then the solves will be done in high precision and the entries in the LU factors will be comverted to high precision with each binary operation. The output d will be in high precision. This is called interprecision transfer on-the-fly and onthefly = true will tell the solvers to do it that way. You have N^2 interprecsion transfers with each solve and, as we will see, that can have a non-trivial cost.","category":"page"},{"location":"","page":"Home","title":"Home","text":"When low precision is Float32, then the default is (onthefly = false). This converts r to low precision, does the solve entirely in low precision, and then promotes d to high precision. You need to be careful to avoid overflow and, more importantly, underflow when you do that and we scale r to be a unit vector before conversion to low precisiion and reverse the scaling when we promote d. We take care of this for you.","category":"page"},{"location":"","page":"Home","title":"Home","text":"mplu calls the constructor for the multiprecision array and then factors the low precision matrix. In some cases, such as nonlinear solvers, you will want to separate the constructor and the factorization. When you do that remember that mplu! overwrites the low precision copy of A with the factors, so you can't resuse the multiprecision array for other problems unless you restore the low precision copy.","category":"page"},{"location":"Details/Termination/#Terminating-the-while-loop","page":"Terminating the while loop","title":"Terminating the while loop","text":"","category":"section"},{"location":"Details/Termination/","page":"Terminating the while loop","title":"Terminating the while loop","text":"We terminate the loop when ","category":"page"},{"location":"Details/Termination/","page":"Terminating the while loop","title":"Terminating the while loop","text":" r   tau  b ","category":"page"},{"location":"Details/Termination/","page":"Terminating the while loop","title":"Terminating the while loop","text":"where we use tau = 10 * eps(TH), where eps(TH) is high precision floating point machine epsilon.  The problem with this criterion is that IR can stagnate, especially for ill-conditioned problems, before the termination criterion is attained. We detect stagnation by looking for a unacceptable decrease (or increase) in the residual norm. So we will terminate the iteration if","category":"page"},{"location":"Details/Termination/","page":"Terminating the while loop","title":"Terminating the while loop","text":" r_new  ge 9  r_old ","category":"page"},{"location":"Details/Termination/","page":"Terminating the while loop","title":"Terminating the while loop","text":"even if the small residual condition is not satisfied.","category":"page"}]
}
