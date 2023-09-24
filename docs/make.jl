push!(LOAD_PATH, "../src/")
using Documenter, MultiPrecisionArrays, DocumenterTools

mathengine = MathJax3(Dict(:loader => Dict("load" => ["[tex]/require", "[tex]/mathtools"]),
                           :tex => Dict("inlineMath" => [["\$", "\$"], ["\\(", "\\)"]],
                                        "packages" => [
                                            "base",
                                            "ams",
                                            "autoload",
                                            "mathtools",
                                            "require",
                                        ])))

makedocs(
    sitename = "MultiPrecisionArrays.jl",
    authors = "C. T. Kelley",
    format = Documenter.HTML(prettyurls = get(ENV, "CI", nothing) == "true"),
    pages = Any[
        "Home"=>"index.md",
        "GMRES-IR" => Any["Half_1.md",], 
        "More than you want to know" => Any["Details/Termination.md", "Details/Interprecision_1.md",],
        "MPArray Constructors" => Any["functions/MPArray.md",],
        "Factorizations"=>Any["functions/hlu!.md", "functions/mplu!.md"],
        "Solvers"=>Any["functions/mpgeslir.md"],
],
)
deploydocs(repo = "github.com/ctkelley/MultiPrecisionArrays.jl.git")
