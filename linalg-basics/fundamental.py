#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Feb 26 17:29:11 2022

@author: moritz
"""
from projection import project
from itertools import product
import numpy as np
from scipy.spatial.transform import Rotation
from matplotlib import pyplot as plt

unitcube_ = list(product(range(2), repeat=3))
unitcube = np.array(unitcube_) + 1
# Camera calibration
K1 = np.array([
    [100, 0, 50],
    [0, 100, 40],
    [0, 0, 1]
])
K2 = np.array([
    [20, 0, 20],
    [0, 20, 40],
    [0, 0, 1]
])

R1 = Rotation.from_euler('xyz', [0, 0, 0], degrees=True).as_matrix()
T1 = np.zeros((3, 1))  # np.array([[0],[0],[0]])

R2 = Rotation.from_euler('xyz', [60, 0, 45], degrees=True).as_matrix()
T2 = np.array([[10], [-5], [5]])

ps1_ = project(unitcube, R1, T1, K1)
ps2_ = project(unitcube, R2, T2, K2)

max_val = np.maximum(ps1_.max(), ps2_.max())
ps1 = ps1_ / 1
ps2 = ps2_ / 1

T_soll = np.subtract(T2, T1)
R_soll = R2.dot(R1)

plt.gca().set_aspect('equal')
plt.scatter(ps1[:, 0], ps1[:, 1])
plt.scatter(ps2[:, 0], ps2[:, 1])
# plt.axes().set_aspect('equal')
plt.show()

"""
https://en.wikipedia.org/wiki/Eight-point_algorithm
"""


def createRow(a, b):
    u = a[0]
    us = b[0]
    v = a[1]
    vs = b[1]
    return [
        us * u,
        us * v,
        us,
        vs * u,
        vs * v,
        vs,
        u,
        v,
        1
    ]


def createRegressionMatrix(ps1, ps2):
    reg = np.zeros((len(ps1), 9))
    for i, (a, b) in enumerate(zip(ps1, ps2)):
        reg[i] = createRow(a, b)

    return reg


A = createRegressionMatrix(ps1, ps2)
A_T_A = A.T.dot(A)
A_S, A_U, A_Vh = np.linalg.svd(A)
# print("A_T_A", A_T_A, "cond(A_T_A)", np.linalg.cond(A_T_A))

eigen_values, eigen_vectors = np.linalg.eig(A_T_A)

eigen_vector_min = eigen_vectors[:, np.argmin(eigen_values)]
eig = A_Vh[-1, :]
print("EigV min", eigen_vector_min)
print("Via SVD (V)", eig / np.linalg.norm(eig))

F = np.reshape(eigen_vector_min, (3, 3))
# solution = np.reshape(eig, (3, 3))

print("Fund. Matrix", F)

E = K2.T.dot(F).dot(K1)

print("Essential Matrix", E)
print("Ess. Rank", np.linalg.matrix_rank(E))

U, S, Vh = np.linalg.svd(E)

print(U, S, Vh)

tshaper = np.array([
    [0, 1, 0],
    [-1, 0, 0],
    [0, 0, 0]
])
T_c = U.dot(tshaper).dot(U.transpose())

T = np.array([T_c[2, 1], T_c[0, 2], T_c[1, 0]])

print('T', T / T[0] * T_soll[0]);
print('T_soll', T_soll)

rshaper = np.array([
    [0, -1, 0],
    [1, 0, 0],
    [0, 0, 1]
])

R = U.dot(rshaper).dot(Vh)

r_ist = Rotation.from_matrix(R)
r_soll = Rotation.from_matrix(R_soll)

print("rist", r_ist.as_euler('xyz', degrees=True))
print("rsoll", r_soll.as_euler('xyz', degrees=True))


def triangu(P, x):
    u = x[0]
    v = x[1]
    return np.array([
        v * P[2] - P[1],
        P[0] - u * P[2]
    ])


P1 = np.column_stack((K1, np.zeros(3)))
P2 = K2.dot(np.column_stack((R, T)))

fig = plt.figure()
ax = fig.add_subplot(projection='3d')


for i,(x1, x2) in enumerate(zip(ps1, ps2)):
    n1 = triangu(P1, x1)
    n2 = triangu(P2, x2)
    temp = np.concatenate((n1, n2))
    tri_u, tri_s, tri_vh = np.linalg.svd(temp)
    armin = np.argmin(tri_s)
    print('argmin', armin)
    vox = tri_vh[armin,0:3]/tri_vh[armin,3]
    print(vox)
    ax.scatter(vox[0],vox[1],vox[2])

plt.show()




