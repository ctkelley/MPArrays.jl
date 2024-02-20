# Terminating the while loop

We terminate the loop when 
```math
\| r \| < \tau \| b \|
```
where we use $\tau = 10 * eps(TH)$, where $eps(TH)$ is high precision floating
point machine epsilon.  The problem with this criterion is
that IR can stagnate, especially for ill-conditioned problems, before
the termination criterion is attained. We detect stagnation by looking
for a unacceptable decrease (or increase) in the residual norm. So we will
terminate the iteration if
```math
\| r_{new} \| \ge .9 \| r_{old} \|
```
even if the small residual condition is not satisfied.
