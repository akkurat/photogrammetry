import numpy as np
from matplotlib import pyplot as plt


def project(unitcube, R, T, K):
    global ps
    print(R)
    print(T.transpose())
    # Outer Camera Orientation
    RT = np.block([R, T])
    print(RT)
    # Inner Orientation
    P = K.dot(RT)
    points = []
    for p in unitcube:
        # print(p)
        V = np.block([np.array(p), 1])
        # print(V)
        point = P.dot(V)
        # print(point)
        points.append([point[0] / point[2], point[1] / point[2]])
    ps = np.array(points)
    return ps
