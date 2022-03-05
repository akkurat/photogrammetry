#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Feb 26 17:29:11 2022

@author: moritz
"""
from functools import reduce

import scipy.optimize

from projection import project
from itertools import product
import numpy as np
from scipy.spatial.transform import Rotation
from matplotlib import pyplot as plt

unitcube_ = [(x, y, 1) for (x, y) in product(range(1, 4), repeat=2)]
# unitcube_ += [(1, y, z) for (z, y) in product(range(1, 4), repeat=2)]
unitcube_ += [(x, 1, z) for (x, z) in product(range(1, 4), repeat=2)]
unitcube = np.array(unitcube_) + 10
# Camera calibration
ref = plt.figure().add_subplot(projection='3d')
ref.scatter(unitcube[:,0], unitcube[:,1], unitcube[:,2])
plt.show()
K1 = np.array([
    [100, 0, 50],
    [0, 100, 40],
    [0, 0, 1]
])
K2 = np.array([
    [90, 0, 45],
    [0, 90, 40],
    [0, 0, 1]
])

K3 = np.array([
    [10, 0, 45],
    [0, 10, 40],
    [0, 0, 1]
])

R1 = Rotation.from_euler('xyz', [-10, -10, 90], degrees=True).as_matrix()
T1 = np.zeros((3, 1))  # np.array([[0],[0],[0]])

R2 = Rotation.from_euler('xyz', [60, 130, 45], degrees=True).as_matrix()
T2 = np.array([[10], [-5], [5]])

R3 = Rotation.from_euler('xyz', [6, 13, 15], degrees=True).as_matrix()
T3 = np.array([[1], [-2], [5]])

ps1 = project(unitcube, R1, T1, K1)
ps2 = project(unitcube, R2, T2, K2)
ps3 = project(unitcube, R3, T3, K3)


T_soll = np.subtract(T2, T1)
R_soll = R2.dot(R1)

plt.gca().set_aspect('equal')
plt.scatter(ps1[:, 0], ps1[:, 1])
plt.scatter(ps2[:, 0], ps2[:, 1])
plt.scatter(ps3[:, 0], ps3[:, 1])
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


def normalizeMat(ps):
    centroid = np.mean(ps, axis=0)
    moved = ps - centroid
    dists = np.linalg.norm(moved, axis=1)
    inv_dist_sq = np.sqrt(2) / np.mean(dists)

    return np.array([
        [inv_dist_sq, 0, -inv_dist_sq * centroid[0]],
        [0, inv_dist_sq, -inv_dist_sq * centroid[1]],
        [0, 0, 1]
    ])


norm1 = normalizeMat(ps1)
ps1_n = np.c_[ps1, np.zeros(np.size(ps1, 0))] @ norm1
norm2 = normalizeMat(ps2)
ps2_n = np.c_[ps2, np.zeros(np.size(ps2, 0))] @ norm2

A = createRegressionMatrix(ps1_n, ps2_n)
A_T_A = A.T @ A
A_S, A_U, A_Vh = np.linalg.svd(A)
# print("A_T_A", A_T_A, "cond(A_T_A)", np.linalg.cond(A_T_A))

eigen_values, eigen_vectors = np.linalg.eig(A_T_A)

eigen_vector_min = eigen_vectors[:, np.argmin(eigen_values)]
print("EigV min", eigen_vector_min)
f_svd = A_Vh[:, -1]
print("Via SVD (V)", f_svd)

def showSolution(f_, norm1, norm2):
    F = norm2.T @ np.reshape(f_, (3, 3)) @ norm1
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

    voxels = np.zeros((np.size(ps1,0),3))
    for i, (x1, x2) in enumerate(zip(ps1, ps2)):
        n1 = triangu(P1, x1)
        n2 = triangu(P2, x2)
        temp = np.concatenate((n1, n2))
        tri_u, tri_s, tri_vh = np.linalg.svd(temp)
        armin = np.argmin(tri_s)
        print('argmin', armin)
        vox = tri_vh[armin, 0:3] / tri_vh[armin, 3]
        print(vox)
        ax.scatter(vox[0], vox[1], vox[2])
        voxels[i] = vox

    # ax.set_xlim3d(-1, 1)
    # ax.set_ylim3d(-1, 1)
    # ax.set_zlim3d(-1, 1)

    plt.show()


showSolution(eigen_vector_min, norm1, norm2)
showSolution(f_svd, norm1, norm2)


# Iterative approach


def totalDistance(F, x1, x2):
    return scipy.spatial.distance.sqeuclidean(x2, F.dot(x1)) + scipy.spatial.distance.sqeuclidean(x1, F.T.dot(x2))


def costFunc(f_):
    F_ = np.reshape(f_, (3, 3))
    cost = 0
    for (x1, x2) in zip(ps1, ps2):
        cost += totalDistance(F_, np.append(x1, 1), np.append(x2, 1))
    return cost


f0 = np.zeros(9)  # eigen_vector_min
# f = scipy.optimize.least_squares( costFunc, f0, method='lm')
f = scipy.optimize.minimize(costFunc, f0, method='Powell', tol=1e-16)

print(f)
print(eigen_vector_min)

showSolution(f.x, np.eye(3), np.eye(3))
