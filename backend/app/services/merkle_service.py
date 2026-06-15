import hashlib
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

class MerkleTreeService:
    """
    Sovereign Cryptographic Integrity Service.
    Implements a Merkle Tree for irrefutable forensic auditing.
    """
    
    def __init__(self):
        self.leaves: List[str] = []
        self.tree: List[List[str]] = []
        self.root: Optional[str] = None

    def _hash(self, data: str) -> str:
        return hashlib.sha256(data.encode('utf-8')).hexdigest()

    def add_leaf(self, data: str) -> str:
        """Add a new audit entry to the tree and recalculate the root."""
        leaf_hash = self._hash(data)
        self.leaves.append(leaf_hash)
        self._build_tree()
        return leaf_hash

    def _build_tree(self):
        """Build the Merkle Tree from current leaves."""
        if not self.leaves:
            self.root = None
            return

        current_level = self.leaves
        self.tree = [current_level]

        while len(current_level) > 1:
            next_level = []
            for i in range(0, len(current_level), 2):
                if i + 1 < len(current_level):
                    combined = current_level[i] + current_level[i+1]
                else:
                    combined = current_level[i] + current_level[i] # Duplicate last leaf if odd
                next_level.append(self._hash(combined))
            current_level = next_level
            self.tree.append(current_level)
        
        self.root = current_level[0]

    def get_root(self) -> str:
        """Retrieve the current cryptographic root of the audit chain."""
        return self.root or "0" * 64

    def get_proof(self, index: int) -> List[str]:
        """Generate a Merkle Proof for a specific leaf index."""
        proof = []
        for level in self.tree[:-1]:
            if index % 2 == 0:
                if index + 1 < len(level):
                    proof.append(level[index + 1])
                else:
                    proof.append(level[index])
            else:
                proof.append(level[index - 1])
            index //= 2
        return proof

    def verify_leaf(self, leaf_hash: str, proof: List[str], root: str) -> bool:
        """Verify a leaf hash against a proof and root."""
        current_hash = leaf_hash
        for p_hash in proof:
            # Sort to ensure consistent hashing
            combined = "".join(sorted([current_hash, p_hash]))
            current_hash = self._hash(combined)
        return current_hash == root

merkle_service = MerkleTreeService()
