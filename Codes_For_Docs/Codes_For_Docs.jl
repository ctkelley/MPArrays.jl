module Codes_For_Docs

using MultiPrecisionArrays
using MultiPrecisionArrays.Examples
using LinearAlgebra
using LinearAlgebra.BLAS
using BenchmarkTools
using Printf

include("IR.jl")
include("HalfTime.jl")
include("Convergence.jl")
include("MakeMPTab.jl")
include("Quality.jl")
include("fprintTeX.jl")


export IR
export HalfTime
export Convergence
export MakeMPTab
export Quality
export conv_tab

end